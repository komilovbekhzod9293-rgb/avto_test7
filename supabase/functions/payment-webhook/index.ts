import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { md5, sha1 } from '../_shared/hash.ts'
import { multicardRequest, TARIFFS } from '../_shared/multicard.ts'
import { getLast7Digits } from '../_shared/phone.ts'
import { broadcastToUser } from '../_shared/realtime.ts'

// Multicard calls this URL for two distinct events (see docs.multicard.uz
// "callback-success" and "callback-webhooks") -- we can't be sure in advance
// which shape arrives, so we detect by field shape and verify accordingly.
//
// Success callback: {store_id, invoice_id, amount, uuid, ..., sign}
//   sign = MD5(store_id + invoice_id + amount + secret)
// Status webhook:    {uuid, invoice_id, amount, status, ..., sign}
//   sign = SHA1(uuid + invoice_id + amount + secret)
//
// On the FIRST transition into "success" for a given payment, grants real
// access: upserts allowed_phones with an expires_at based on the tariff's
// duration. Renewals stack on top of whatever time is left (or from today if
// already expired) rather than overwriting it. A row with expires_at = null
// (added by hand by the owner for cash-paying students) is left alone --
// never downgraded to an expiring grant.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ success: true }, 200)

  const db = createDb()

  try {
    const body = await req.json()
    const secret = Deno.env.get('MULTICARD_SECRET')
    if (!secret) throw new Error('MULTICARD_SECRET not configured')

    const isStatusWebhook = typeof body.status === 'string'
    const expectedSign = isStatusWebhook
      ? sha1(`${body.uuid}${body.invoice_id}${body.amount}${secret}`)
      : md5(`${body.store_id}${body.invoice_id}${body.amount}${secret}`)

    if (!body.sign || body.sign !== expectedSign) {
      console.error('payment-webhook: signature mismatch', { invoice_id: body.invoice_id, isStatusWebhook })
      return json({ error: 'invalid_signature' }, 400)
    }

    const invoice_id: string | undefined = body.invoice_id
    if (!invoice_id) return json({ error: 'missing_invoice_id' }, 400)

    const { data: payment } = await db
      .from('payments')
      .select('id, multicard_uuid, status, phone, tariff, user_id')
      .eq('invoice_id', invoice_id)
      .maybeSingle()

    if (!payment) {
      // Nothing we recognize -- ack anyway so Multicard doesn't retry forever.
      console.error('payment-webhook: unknown invoice_id', invoice_id)
      return json({ success: true })
    }

    // Never trust the callback payload alone for the final status -- re-fetch
    // the authoritative state from Multicard before recording it. But the
    // GET can lag behind the callback that just fired (eventual consistency
    // on Multicard's side), so never let a non-terminal GET result downgrade
    // a terminal status we already know about -- only let the GET result win
    // when it's itself terminal, or when we don't have a terminal status yet.
    const TERMINAL = new Set(['success', 'error', 'revert'])
    const uuid = body.uuid ?? payment.multicard_uuid
    let resolvedStatus = isStatusWebhook ? body.status : 'success'
    if (uuid) {
      try {
        const invoice = await multicardRequest<{ payment?: { status?: string } }>(
          'GET',
          `/payment/invoice/${uuid}`,
        )
        const verifiedStatus = invoice?.payment?.status
        if (verifiedStatus && (TERMINAL.has(verifiedStatus) || !TERMINAL.has(resolvedStatus))) {
          resolvedStatus = verifiedStatus
        }
      } catch (verifyErr) {
        console.error('payment-webhook: re-verify failed, trusting callback status', verifyErr)
      }
    }

    // Grant access only on the FIRST observed transition into "success" --
    // Multicard retries webhooks, and without this guard a retry would push
    // expires_at forward again and give the student extra free days.
    if (resolvedStatus === 'success' && payment.status !== 'success') {
      try {
        await grantAccess(db, payment.phone, payment.tariff)
        if (payment.user_id) await broadcastToUser(payment.user_id, 'access_granted', {})
      } catch (grantErr) {
        // Don't let a grant failure stop us from recording the payment status
        // -- the row stays reconcilable (status=success, access not yet
        // granted) and can be fixed by hand rather than silently lost.
        console.error('payment-webhook: grantAccess failed', grantErr)
      }
    }

    await db
      .from('payments')
      .update({
        status: resolvedStatus,
        multicard_uuid: uuid ?? null,
        last_webhook: body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    return json({ success: true })
  } catch (error) {
    console.error('payment-webhook error:', error)
    // Ack 200 regardless -- an internal error on our side shouldn't make
    // Multicard hammer retries; we can always reconcile via GET /payment/invoice.
    return json({ success: true })
  }
})

// deno-lint-ignore no-explicit-any
async function grantAccess(db: any, phone: string, tariff: string) {
  const plan = TARIFFS[tariff]
  if (!plan) throw new Error(`grantAccess: unknown tariff "${tariff}"`)

  const last7 = getLast7Digits(phone)
  const now = Date.now()
  const durationMs = plan.durationDays * 24 * 60 * 60 * 1000

  const { data: existingRows } = await db
    .from('allowed_phones')
    .select('telefon_raqami, expires_at')
    .ilike('telefon_raqami', `%${last7}`)
    .limit(5)

  // A permanent (expires_at = null) grant, however it got there, is never
  // downgraded to an expiring one -- treat it as "already has more than this
  // purchase gives". allowed_phones has no reliable primary key we can
  // assume exists (it predates our migrations, created by hand), so every
  // write below matches on the exact telefon_raqami value we just read back.
  const permanentRow = (existingRows ?? []).find((r) => !r.expires_at)
  if (permanentRow) {
    await db.from('allowed_phones').update({ tariff }).eq('telefon_raqami', permanentRow.telefon_raqami)
    return
  }

  // Renewal stacks on top of the latest still-tracked expiry (or from now,
  // if everything on file has already lapsed) instead of resetting it.
  const latestExpiry = (existingRows ?? []).reduce((max: number, r: { expires_at: string | null }) => {
    const t = r.expires_at ? new Date(r.expires_at).getTime() : 0
    return t > max ? t : max
  }, 0)
  const newExpiresAt = new Date(Math.max(now, latestExpiry) + durationMs).toISOString()

  const existingRow = (existingRows ?? [])[0]
  if (existingRow) {
    await db.from('allowed_phones').update({ expires_at: newExpiresAt, tariff }).eq('telefon_raqami', existingRow.telefon_raqami)
  } else {
    await db.from('allowed_phones').insert({ telefon_raqami: phone, expires_at: newExpiresAt, tariff })
  }
}
