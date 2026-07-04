import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getClientIp } from './clientIp.ts'
import { getLast9Digits } from './phone.ts'

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
    .select('id, phone, login, avatar_url, device_id, is_shared')
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

    return { user: { id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url, isShared: true, fullAccess: true } }
  }

  if (user.device_id !== device_id) return { error: 'device_revoked' }

  // Non-allowed users are NOT rejected anymore — they log in as trial users
  // (fullAccess=false). Content gating happens per-action in get-data so the
  // free trial (lesson 1 + Yakuniy) works while paid lessons stay protected.
  const { data: allowedRow } = await db
    .from('allowed_phones')
    .select('telefon_raqami')
    .ilike('telefon_raqami', `%${getLast9Digits(user.phone)}`)
    .maybeSingle()

  return { user: { id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url, isShared: false, fullAccess: !!allowedRow } }
}
