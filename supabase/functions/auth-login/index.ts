import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { verifyPassword } from '../_shared/password.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { login, password, device_id, confirm_device_override } = await req.json()

    if (
      !login || typeof login !== 'string' ||
      !password || typeof password !== 'string' ||
      !device_id || typeof device_id !== 'string'
    ) {
      return json({ error: 'invalid_input' }, 400)
    }

    const db = createDb()

    const { data: user, error } = await db
      .from('app_users')
      .select('id, phone, login, password_hash, avatar_url, device_id')
      .ilike('login', login.trim())
      .maybeSingle()

    if (error || !user || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: 'invalid_credentials' }, 401)
    }

    const { data: allowedRow } = await db
      .from('allowed_phones')
      .select('telefon_raqami')
      .eq('telefon_raqami', user.phone)
      .maybeSingle()
    if (!allowedRow) return json({ error: 'access_revoked' }, 403)

    if (user.device_id && user.device_id !== device_id && confirm_device_override !== true) {
      return json({ error: 'device_mismatch' }, 409)
    }

    const sessionToken = crypto.randomUUID()

    const { data: updated, error: updateErr } = await db
      .from('app_users')
      .update({
        device_id,
        session_token: sessionToken,
        session_created_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, phone, login, avatar_url')
      .single()
    if (updateErr) throw updateErr

    return json({ data: { user: updated, session_token: sessionToken } })
  } catch (error) {
    console.error('auth-login error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
