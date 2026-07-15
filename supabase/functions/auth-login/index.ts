import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { verifyPassword } from '../_shared/password.ts'
import { botUrlFor } from '../_shared/telegram.ts'
import { getClientIp } from '../_shared/clientIp.ts'
import { getLast7Digits } from '../_shared/phone.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { login, password, device_id, verification_id } = await req.json()

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
      .select('id, phone, login, password_hash, avatar_url, device_id, device_ids, is_shared, session_token')
      .ilike('login', login.trim())
      .maybeSingle()

    if (error || !user || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: 'invalid_credentials' }, 401)
    }

    // Shared "lab computer" account: no Telegram verification, no
    // single-device lock, no allowed_phones check -- gated by IP instead,
    // and the session token is fixed (never rotated) so every lab PC that
    // logs in gets back the same token with no per-device slot to fight over.
    if (user.is_shared) {
      const { data: allowedIp } = await db
        .from('lab_allowed_ips')
        .select('ip')
        .eq('ip', getClientIp(req))
        .maybeSingle()
      if (!allowedIp) return json({ error: 'ip_not_allowed' }, 403)

      return json({
        data: {
          user: { id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url },
          session_token: user.session_token,
          full_access: true,
        },
      })
    }

    // Full access = phone is in allowed_phones (paid). Everyone else can still
    // log in as a trial user (lesson 1 + Yakuniy test); paid lessons are locked.
    // .limit(1) before .maybeSingle(): allowed_phones sometimes has the same
    // number entered twice in different formats, which both match the ilike
    // pattern -- without the limit, .maybeSingle() errors on >1 row and this
    // silently fell back to "not allowed".
    const { data: allowedRows } = await db
      .from('allowed_phones')
      .select('telefon_raqami')
      .ilike('telefon_raqami', `%${getLast7Digits(user.phone)}`)
      .limit(1)
    const fullAccess = !!allowedRows && allowedRows.length > 0

    // An account may sign in from a few real devices (phone + laptop + the
    // Telegram in-app browser), so we keep a small allowlist instead of a
    // single device_id: a known device signs in silently, and only a device
    // beyond the limit must be confirmed by the phone owner via the Telegram
    // bot -- which is what stops a password being passed around a class.
    // (device_id is per-origin localStorage, so a strict 1-device rule locked
    // out the whole user base when the domain moved.)
    const MAX_DEVICES = 3
    const knownDevices: string[] = Array.isArray(user.device_ids)
      ? user.device_ids.filter((d: unknown): d is string => typeof d === 'string' && d.length > 0)
      : []
    const isKnownDevice = knownDevices.includes(device_id)

    if (!isKnownDevice && knownDevices.length >= MAX_DEVICES) {
      if (!verification_id || typeof verification_id !== 'string') {
        const { data: row, error: insertErr } = await db
          .from('phone_verifications')
          .insert({ phone: user.phone, purpose: 'login', account_login: user.login })
          .select('id')
          .single()
        if (insertErr) throw insertErr

        return json({
          error: 'device_mismatch',
          verification_id: row.id,
          bot_url: botUrlFor(row.id),
        })
      }

      const { data: verification } = await db
        .from('phone_verifications')
        .select('phone, verified, expires_at')
        .eq('id', verification_id)
        .maybeSingle()

      const valid =
        verification &&
        verification.verified &&
        verification.phone === user.phone &&
        new Date(verification.expires_at).getTime() >= Date.now()

      if (!valid) return json({ error: 'phone_not_verified' }, 403)
    }

    const sessionToken = crypto.randomUUID()

    // Add this device to the allowlist, keeping the newest MAX_DEVICES. Once
    // full, the oldest slot is dropped -- the sign-in that got here was either
    // from a known device or already confirmed via Telegram above.
    const nextDevices = isKnownDevice ? knownDevices : [...knownDevices, device_id].slice(-MAX_DEVICES)

    const { data: updated, error: updateErr } = await db
      .from('app_users')
      .update({
        device_id, // last device used -- kept for compatibility
        device_ids: nextDevices,
        session_token: sessionToken,
        session_created_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, phone, login, avatar_url')
      .single()
    if (updateErr) throw updateErr

    return json({ data: { user: updated, session_token: sessionToken, full_access: fullAccess } })
  } catch (error) {
    console.error('auth-login error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
