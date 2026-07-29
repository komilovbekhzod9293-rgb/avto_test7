import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getLast7Digits } from './phone.ts'

export interface AccessInfo {
  fullAccess: boolean
  // Which paid tariff granted access ('standard'/'pro'/'max'), or null for
  // manually-added legacy grants that predate tariff tracking. A null tariff
  // is treated as having every feature (including video) -- these are
  // pre-existing customers who were never asked to pick a tier, so we don't
  // retroactively take features away from them.
  tariff: string | null
  // ISO timestamp, or null for a permanent (manual) grant with no expiry.
  expiresAt: string | null
}

const NO_ACCESS: AccessInfo = { fullAccess: false, tariff: null, expiresAt: null }

// Full access = phone is in allowed_phones AND not expired. expires_at is
// nullable: null means "never expires" (manual grants, added by hand for
// cash-paying students, keep working exactly as before). Paid-via-Multicard
// rows get a real expires_at set by payment-webhook.
//
// .limit(5) instead of .maybeSingle()/.single(): allowed_phones is filled in
// by hand and sometimes has the same number twice in different formats --
// both match the ilike pattern, and .maybeSingle() throws on >1 row. When
// there are multiple matching rows, prefer whichever is currently valid,
// and among valid ones prefer a permanent (no expiry) grant.
export async function getAccessInfo(db: SupabaseClient, phone: string): Promise<AccessInfo> {
  const last7 = getLast7Digits(phone)
  if (!last7) return NO_ACCESS

  const { data: rows } = await db
    .from('allowed_phones')
    .select('tariff, expires_at')
    .ilike('telefon_raqami', `%${last7}`)
    .limit(5)

  if (!rows || rows.length === 0) return NO_ACCESS

  const now = Date.now()
  const valid = rows.filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now)
  if (valid.length === 0) return NO_ACCESS

  const permanent = valid.find((r) => !r.expires_at)
  const chosen = permanent ?? valid.sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())[valid.length - 1]
  return { fullAccess: true, tariff: chosen.tariff ?? null, expiresAt: chosen.expires_at ?? null }
}

export async function checkFullAccess(db: SupabaseClient, phone: string): Promise<boolean> {
  return (await getAccessInfo(db, phone)).fullAccess
}
