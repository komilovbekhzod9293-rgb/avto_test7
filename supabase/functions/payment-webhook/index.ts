import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { md5, sha1 } from '../_shared/hash.ts'
import { multicardRequest } from '../_shared/multicard.ts'

// Multicard calls this URL for two distinct events (see docs.multicard.uz
// "callback-success" and "callback-webhooks") -- we can't be sure in advance
// which shape arrives, so we detect by field shape and verify accordingly.
//
// Success callback: {store_id, invoice_id, amount, uuid, ..., sign}
//   sign = MD5(store_id + invoice_id + amount + secret)
// Status webhook:    {uuid, invoice_id, amount, status, ..., sign}
//   sign = SHA1(uuid + invoice_id + amount + secret)
//
// TEST PHASE: this only records status in `payments` -- it does not yet grant
// course access (allowed_phones). That wiring is a deliberate follow-up once
// the sandbox round-trip is confirmed working end to end.

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
      .select('id, multicard_uuid, status')
      .eq('invoice_id', invoice_id)
      .maybeSingle()

    if (!payment) {
      // Nothing we recognize -- ack anyway so Multicard doesn't retry forever.
      console.error('payment-webhook: unknown invoice_id', invoice_id)
      return json({ success: true })
    }

    // Never trust the callback payload alone for the final status -- re-fetch
    // the authoritative state from Multicard before recording it.
    const uuid = body.uuid ?? payment.multicard_uuid
    let resolvedStatus = isStatusWebhook ? body.status : 'success'
    if (uuid) {
      try {
        const invoice = await multicardRequest<{ payment?: { status?: string } }>(
          'GET',
          `/payment/invoice/${uuid}`,
        )
        if (invoice?.payment?.status) resolvedStatus = invoice.payment.status
      } catch (verifyErr) {
        console.error('payment-webhook: re-verify failed, trusting callback status', verifyErr)
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
