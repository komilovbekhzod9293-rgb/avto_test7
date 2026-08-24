import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { verifyPassword } from '../_shared/password.ts'
import { getClientIp } from '../_shared/clientIp.ts'
import { getAccessInfo } from '../_shared/access.ts'

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
      .select('id, phone, login, password_hash, avatar_url, device_id, device_ids, is_shared, session_token, trial_expires_at')
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
          tariff: null,
          access_expires_at: null,
          trial_expires_at: null,
        },
      })
    }

    // Full access = phone is in allowed_phones (paid) and not expired.
    // Everyone else can still log in as a trial user (lesson 1 + Yakuniy
    // test); paid lessons are locked.
    const access = await getAccessInfo(db, user.phone)

    // An account may sign in from a few real devices (phone + laptop + a
    // shared computer at the training centre), so we keep a small allowlist
    // instead of a single device_id. Signing in is always silent: a device
    // beyond the limit is simply added and the oldest one drops off (see
    // nextDevices below). Requiring the phone owner's Telegram for a new
    // device used to gate this, but students on the centre's shared PCs
    // don't have their Telegram there, which kept them out of a course they
    // had already paid for.
    // (device_id is per-origin localStorage, so a strict 1-device rule locked
    // out the whole user base when the domain moved.)
    const MAX_DEVICES = 3
    const knownDevices: string[] = Array.isArray(user.device_ids)
      ? user.device_ids.filter((d: unknown): d is string => typeof d === 'string' && d.length > 0)
      : []
    const isKnownDevice = knownDevices.includes(device_id)

    const sessionToken = crypto.randomUUID()

    // Add this device to the allowlist, keeping the newest MAX_DEVICES. Once
    // full, the oldest slot is dropped -- that device's next request fails
    // validateSession's device check and it signs out on its own.
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

    return json({
      data: {
        user: updated,
        session_token: sessionToken,
        full_access: access.fullAccess,
        tariff: access.tariff,
        access_expires_at: access.expiresAt,
        trial_expires_at: access.fullAccess ? null : user.trial_expires_at,
      },
    })
  } catch (error) {
    console.error('auth-login error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
