import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { getLast7Digits } from '../_shared/phone.ts'
import { BOT_USERNAME, botUrlFor } from '../_shared/telegram.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { action, phone, verification_id } = await req.json()
    const db = createDb()

    // Recovery only needs the phone -- the Telegram bot confirmation is the
    // actual identity proof, so there's no point also requiring the login
    // (which is exactly what someone locked out is likely to have forgotten).
    if (action === 'start_reset') {
      if (!phone || typeof phone !== 'string') return json({ error: 'invalid_input' }, 400)
      const last7 = getLast7Digits(phone)
      if (last7.length < 7) return json({ error: 'invalid_input' }, 400)

      // .limit(1): a duplicate/near-duplicate phone entry matching the same
      // last-7-digit suffix would make .maybeSingle() error on >1 row.
      const { data: users } = await db
        .from('app_users')
        .select('phone, login')
        .ilike('phone', `%${last7}`)
        .limit(1)
      const user = users?.[0]
      if (!user) return json({ error: 'phone_not_registered' }, 404)

      const { data: row, error: insertErr } = await db
        .from('phone_verifications')
        .insert({ phone: user.phone, purpose: 'reset', account_login: user.login })
        .select('id')
        .single()
      if (insertErr) throw insertErr

      return json({
        data: {
          verification_id: row.id,
          bot_username: BOT_USERNAME,
          bot_url: botUrlFor(row.id),
        },
      })
    }

    if (action === 'start') {
      if (!phone || typeof phone !== 'string') return json({ error: 'invalid_input' }, 400)
      const last7 = getLast7Digits(phone)
      if (last7.length < 7) return json({ error: 'invalid_input' }, 400)

      // Registration is open to everyone (free trial: lesson 1 + Yakuniy test).
      // Full access to the rest is gated by allowed_phones at login/register.
      const { data: existingUsers } = await db
        .from('app_users')
        .select('id')
        .ilike('phone', `%${last7}`)
        .limit(1)
      if (existingUsers && existingUsers.length > 0) return json({ error: 'phone_already_registered' }, 409)

      const { data: row, error: insertErr } = await db
        .from('phone_verifications')
        .insert({ phone })
        .select('id')
        .single()
      if (insertErr) throw insertErr

      return json({
        data: {
          verification_id: row.id,
          bot_username: BOT_USERNAME,
          bot_url: botUrlFor(row.id),
        },
      })
    }

    if (action === 'status') {
      if (!verification_id || typeof verification_id !== 'string') return json({ error: 'invalid_input' }, 400)

      const { data: row } = await db
        .from('phone_verifications')
        .select('verified, expires_at, purpose, account_login')
        .eq('id', verification_id)
        .maybeSingle()

      if (!row) return json({ data: { verified: false, expired: true } })
      const expired = new Date(row.expires_at).getTime() < Date.now()
      return json({
        data: { verified: row.verified, expired, purpose: row.purpose, account_login: row.account_login },
      })
    }

    return json({ error: 'invalid_action' }, 400)
  } catch (error) {
    console.error('phone-verify error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
