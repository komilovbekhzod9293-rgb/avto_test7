import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface SessionUser {
  id: string
  phone: string
  login: string
  avatar_url: string | null
}

export type SessionError = 'invalid_session' | 'device_revoked' | 'access_revoked'

export async function validateSession(
  db: SupabaseClient,
  session_token: unknown,
  device_id: unknown,
): Promise<{ user: SessionUser } | { error: SessionError }> {
  if (!session_token || typeof session_token !== 'string' || !device_id || typeof device_id !== 'string') {
    return { error: 'invalid_session' }
  }

  const { data: user, error } = await db
    .from('app_users')
    .select('id, phone, login, avatar_url, device_id')
    .eq('session_token', session_token)
    .maybeSingle()

  if (error || !user) return { error: 'invalid_session' }
  if (user.device_id !== device_id) return { error: 'device_revoked' }

  const { data: allowedRow } = await db
    .from('allowed_phones')
    .select('telefon_raqami')
    .eq('telefon_raqami', user.phone)
    .maybeSingle()

  if (!allowedRow) return { error: 'access_revoked' }

  return { user: { id: user.id, phone: user.phone, login: user.login, avatar_url: user.avatar_url } }
}
