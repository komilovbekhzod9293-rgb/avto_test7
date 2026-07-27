import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

// Called on a schedule by an n8n workflow -- removes allowed_phones rows
// whose paid access has expired. Access itself already stops working the
// moment expires_at passes (checkFullAccess checks it live on every
// login/session-check), so this is just housekeeping: it keeps the table
// matching "who currently has access" instead of accumulating stale rows,
// and never touches manually-added permanent grants (expires_at IS NULL).
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

    const { data: expired, error: selErr } = await db
      .from('allowed_phones')
      .select('telefon_raqami, tariff, expires_at')
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString())
    if (selErr) throw selErr

    if (!expired || expired.length === 0) {
      return json({ data: { removed: 0, phones: [] } })
    }

    const { error: delErr } = await db
      .from('allowed_phones')
      .delete()
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString())
    if (delErr) throw delErr

    return json({ data: { removed: expired.length, phones: expired.map((r) => r.telefon_raqami) } })
  } catch (error) {
    console.error('admin-expire-access error:', error)
    return json({ error: 'internal_error', detail: String(error) }, 500)
  }
})
