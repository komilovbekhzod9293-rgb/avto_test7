import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { hashPassword } from '../_shared/password.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getLast9Digits(input: string): string {
  return (input || '').replace(/\D/g, '').slice(-9)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, login, password, device_id } = await req.json()

    if (
      !phone || typeof phone !== 'string' ||
      !login || typeof login !== 'string' || login.trim().length < 3 ||
      !password || typeof password !== 'string' || password.length < 6 ||
      !device_id || typeof device_id !== 'string'
    ) {
      return json({ error: 'invalid_input' }, 400)
    }

    const last9 = getLast9Digits(phone)
    if (last9.length < 9) return json({ error: 'invalid_input' }, 400)

    const db = createDb()

    const { data: allowedMatches, error: allowedErr } = await db
      .from('allowed_phones')
      .select('telefon_raqami')
      .ilike('telefon_raqami', `%${last9}`)
      .limit(1)
    if (allowedErr) throw allowedErr

    const allowedRow = allowedMatches && allowedMatches.length > 0 ? allowedMatches[0] : null
    if (!allowedRow) return json({ error: 'phone_not_allowed' }, 403)

    const canonicalPhone = allowedRow.telefon_raqami as string

    const { data: existingPhone } = await db
      .from('app_users')
      .select('id')
      .eq('phone', canonicalPhone)
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

    return json({ data: { user, session_token: sessionToken } })
  } catch (error) {
    console.error('auth-register error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
