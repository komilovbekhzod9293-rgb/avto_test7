import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getClientIp } from './clientIp.ts'
import { getAccessInfo } from './access.ts'

export interface SessionUser {
  id: string
  phone: string
  login: string
  avatar_url: string | null
  isShared: boolean
  // Full (paid) access = phone is in allowed_phones. Trial users (registered
  // but not paid) get fullAccess=false — they only reach lesson 1 + the Yakuniy
  // test (enforced per-action in get-data).
  fullAccess: boolean
  // Which tariff granted access, and when it expires -- null/null for trial,
  // shared-lab accounts, and legacy manual (permanent) grants.
  tariff: string | null
  accessExpiresAt: string | null
  // 7-day trial window, set at registration. Null for paid/shared accounts
  // and for pre-existing accounts registered before this was introduced
  // (grandfathered, no expiry enforced).
  trialExpiresAt: string | null
}

export type SessionError = 'invalid_session' | 'device_revoked' | 'access_revoked'

export async function validateSession(
  db: SupabaseClient,
  session_token: unknown,
  device_id: unknown,
  req: Request,
): Promise<{ user: SessionUser } | { error: SessionError }> {
  if (!session_token || typeof session_token !== 'string' || !device_id || typeof device_id !== 'string') {
    return { error: 'invalid_session' }
  }

  const { data: user, error } = await db
    .from('app_users')
    .select('id, phone, login, avatar_url, device_id, device_ids, is_shared, trial_expires_at')
    .eq('session_token', session_token)
    .maybeSingle()

  if (error || !user) return { error: 'invalid_session' }

  // Shared "lab computer" accounts have no single-device slot and aren't
  // in allowed_phones at all -- they're gated by IP instead (see
  // auth-login), so any number of devices with this token stay valid
  // forever as long as they're on the school's network.
  if (user.is_shared) {
    const { data: allowedIp } = await db
      .from('lab_allowed_ips')
      .select('ip')
      .eq('ip', getClientIp(req))
      .maybeSingle()
    if (!allowedIp) return { error: 'invalid_session' }

    return {
      user: {
        id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url,
        isShared: true, fullAccess: true, tariff: null, accessExpiresAt: null, trialExpiresAt: null,
      },
    }
  }

  // An account is allowed a few devices (see auth-login). Deliberately
  // permissive so a live session is never dropped mid-study:
  //  - allowlist present -> the device must be on it
  //  - allowlist empty (row not seeded yet / brand-new account) -> fall back to
  //    the legacy single device_id, and allow when nothing is bound at all.
  // Sign-in is what binds devices; this check only rejects a clearly foreign one.
  const knownDevices: string[] = Array.isArray(user.device_ids)
    ? user.device_ids.filter((d: unknown): d is string => typeof d === 'string' && d.length > 0)
    : []
  const deviceAllowed =
    knownDevices.length > 0 ? knownDevices.includes(device_id) : !user.device_id || user.device_id === device_id
  if (!deviceAllowed) return { error: 'device_revoked' }

  // Non-allowed users are NOT rejected anymore — they log in as trial users
  // (fullAccess=false). Content gating happens per-action in get-data so the
  // free trial (lesson 1 + Yakuniy) works while paid lessons stay protected.
  const access = await getAccessInfo(db, user.phone)

  return {
    user: {
      id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url, isShared: false,
      fullAccess: access.fullAccess, tariff: access.tariff, accessExpiresAt: access.expiresAt,
      trialExpiresAt: access.fullAccess ? null : user.trial_expires_at,
    },
  }
}
