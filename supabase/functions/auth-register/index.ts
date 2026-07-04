import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { hashPassword } from '../_shared/password.ts'
import { getLast9Digits } from '../_shared/phone.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { verification_id, login, password, device_id } = await req.json()

    if (
      !verification_id || typeof verification_id !== 'string' ||
      !login || typeof login !== 'string' || login.trim().length < 3 ||
      !password || typeof password !== 'string' || password.length < 6 ||
      !device_id || typeof device_id !== 'string'
    ) {
      return json({ error: 'invalid_input' }, 400)
    }

    const db = createDb()

    const { data: verification } = await db
      .from('phone_verifications')
      .select('phone, verified, expires_at')
      .eq('id', verification_id)
      .maybeSingle()

    if (!verification || !verification.verified) return json({ error: 'phone_not_verified' }, 403)
    if (new Date(verification.expires_at).getTime() < Date.now()) return json({ error: 'verification_expired' }, 403)

    const canonicalPhone = verification.phone as string
    const last9 = getLast9Digits(canonicalPhone)

    // Anyone can register (free trial). Full access = phone is in allowed_phones.
    const { data: allowedRow } = await db
      .from('allowed_phones')
      .select('telefon_raqami')
      .ilike('telefon_raqami', `%${last9}`)
      .maybeSingle()
    const fullAccess = !!allowedRow

    const { data: existingPhone } = await db
      .from('app_users')
      .select('id')
      .ilike('phone', `%${last9}`)
      .maybeSingle()
    if (existingPhone) return json({ error: 'phone_already_registered' }, 409)

    const { data: existingLogin } = await db
      .from('app_users')
      .select('id')
      .ilike('login', login.trim())
      .maybeSingle()
    if (existingLogin) return json({ error: 'login_taken' }, 409)

    const passwordHash = await hashPassword(password)
    const sessionToken = crypto.randomUUID()

    const { data: user, error: insertErr } = await db
      .from('app_users')
      .insert({
        phone: canonicalPhone,
        login: login.trim(),
        password_hash: passwordHash,
        device_id,
        session_token: sessionToken,
        session_created_at: new Date().toISOString(),
      })
      .select('id, phone, login, avatar_url')
      .single()
    if (insertErr) throw insertErr

    await db.from('user_stats').insert({ user_id: user.id })

    return json({ data: { user, session_token: sessionToken, full_access: fullAccess } })
  } catch (error) {
    console.error('auth-register error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
