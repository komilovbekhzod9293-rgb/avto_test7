import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { hashPassword } from '../_shared/password.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { verification_id, new_password } = await req.json()

    if (
      !verification_id || typeof verification_id !== 'string' ||
      !new_password || typeof new_password !== 'string' || new_password.length < 6
    ) {
      return json({ error: 'invalid_input' }, 400)
    }

    const db = createDb()

    const { data: verification } = await db
      .from('phone_verifications')
      .select('phone, verified, expires_at, purpose, account_login')
      .eq('id', verification_id)
      .maybeSingle()

    if (!verification || verification.purpose !== 'reset') return json({ error: 'invalid_input' }, 400)
    if (!verification.verified) return json({ error: 'phone_not_verified' }, 403)
    if (new Date(verification.expires_at).getTime() < Date.now()) return json({ error: 'verification_expired' }, 403)

    const passwordHash = await hashPassword(new_password)

    // Log out every device on this account -- a password reset means the
    // old password could have leaked, so any session started under it
    // should not silently keep working.
    const { error: updateErr } = await db
      .from('app_users')
      .update({ password_hash: passwordHash, session_token: null, device_id: null })
      .eq('phone', verification.phone)
      .ilike('login', verification.account_login ?? '')
    if (updateErr) throw updateErr

    return json({ data: { ok: true } })
  } catch (error) {
    console.error('auth-reset-password error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
