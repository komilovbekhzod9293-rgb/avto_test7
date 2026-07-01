import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { getLast9Digits } from '../_shared/phone.ts'
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

    if (action === 'start') {
      if (!phone || typeof phone !== 'string') return json({ error: 'invalid_input' }, 400)
      const last9 = getLast9Digits(phone)
      if (last9.length < 9) return json({ error: 'invalid_input' }, 400)

      const { data: allowedMatches, error: allowedErr } = await db
        .from('allowed_phones')
        .select('telefon_raqami')
        .ilike('telefon_raqami', `%${last9}`)
        .limit(1)
      if (allowedErr) throw allowedErr

      const allowedRow = allowedMatches && allowedMatches.length > 0 ? allowedMatches[0] : null
      if (!allowedRow) return json({ error: 'phone_not_allowed' }, 403)

      const { data: existingUser } = await db
        .from('app_users')
        .select('id')
        .eq('phone', allowedRow.telefon_raqami)
        .maybeSingle()
      if (existingUser) return json({ error: 'phone_already_registered' }, 409)

      const { data: row, error: insertErr } = await db
        .from('phone_verifications')
        .insert({ phone: allowedRow.telefon_raqami })
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
        .select('verified, expires_at')
        .eq('id', verification_id)
        .maybeSingle()

      if (!row) return json({ data: { verified: false, expired: true } })
      const expired = new Date(row.expires_at).getTime() < Date.now()
      return json({ data: { verified: row.verified, expired } })
    }

    return json({ error: 'invalid_action' }, 400)
  } catch (error) {
    console.error('phone-verify error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
