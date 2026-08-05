import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { grantAccess, getAccessInfo } from '../_shared/access.ts'
import { sendAdminAlert } from '../_shared/telegram.ts'

// Periodic safety net (called on a schedule by an n8n workflow, same pattern
// as admin-expire-access): finds successful payments whose phone currently
// has NO paid access, and grants it. This is the backstop for the case
// payment-webhook's own retry + alert (see grantAccess call there) didn't
// cover -- e.g. the whole invocation crashed before it got that far, or the
// alert itself failed to send. Idempotent and safe to run often: a phone
// that already has valid access is simply skipped.
//
// Gated by the existing CONSULTANT_LOOKUP_SECRET (no new secret needed) via
// header x-admin-secret.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = Deno.env.get('CONSULTANT_LOOKUP_SECRET')
  if (!secret || req.headers.get('x-admin-secret') !== secret) {
    return json({ error: 'unauthorized' }, 401)
  }

  try {
    const db = createDb()

    const { data: payments, error } = await db
      .from('payments')
      .select('id, phone, tariff')
      .eq('status', 'success')
    if (error) throw error

    const fixed: { payment_id: string; phone: string; tariff: string }[] = []
    const failed: { payment_id: string; phone: string; error: string }[] = []

    for (const p of payments ?? []) {
      const access = await getAccessInfo(db, p.phone)
      if (access.fullAccess) continue // already has valid access -- nothing to do

      try {
        await grantAccess(db, p.phone, p.tariff)
        fixed.push({ payment_id: p.id, phone: p.phone, tariff: p.tariff })
      } catch (err) {
        failed.push({ payment_id: p.id, phone: p.phone, error: String(err) })
      }
    }

    if (fixed.length > 0 || failed.length > 0) {
      const lines = [
        fixed.length > 0
          ? `✅ ${fixed.length} та тўлов доступсиз топилди ва доступ берилди:\n` +
            fixed.map((f) => `  ${f.phone} (${f.tariff})`).join('\n')
          : null,
        failed.length > 0
          ? `❌ ${failed.length} та тўловни тузатиб бўлмади:\n` +
            failed.map((f) => `  ${f.phone}: ${f.error}`).join('\n')
          : null,
      ].filter(Boolean)
      await sendAdminAlert(`admin-reconcile-payments:\n${lines.join('\n\n')}`)
    }

    return json({ data: { checked: payments?.length ?? 0, fixed: fixed.length, failed: failed.length } })
  } catch (error) {
    console.error('admin-reconcile-payments error:', error)
    return json({ error: 'internal_error', detail: String(error) }, 500)
  }
})
