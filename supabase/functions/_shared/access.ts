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

const TARIFF_DURATIONS: Record<string, number> = { standard: 14, pro: 30, max: 30 }

// Grants (or extends) paid access for `phone` after a successful payment.
// Renewal stacks on top of whatever time is left (or from now, if already
// expired) rather than overwriting it. A permanent (expires_at = null) grant,
// however it got there, is never downgraded to an expiring one.
//
// Shared between payment-webhook (real-time, on the payment callback) and
// admin-reconcile-payments (periodic safety net for when the real-time path
// didn't take effect) so both use identical logic.
export async function grantAccess(db: SupabaseClient, phone: string, tariff: string): Promise<void> {
  const durationDays = TARIFF_DURATIONS[tariff]
  if (!durationDays) throw new Error(`grantAccess: unknown tariff "${tariff}"`)

  const last7 = getLast7Digits(phone)
  const now = Date.now()
  const durationMs = durationDays * 24 * 60 * 60 * 1000

  const { data: existingRows } = await db
    .from('allowed_phones')
    .select('telefon_raqami, expires_at')
    .ilike('telefon_raqami', `%${last7}`)
    .limit(5)

  const permanentRow = (existingRows ?? []).find((r) => !r.expires_at)
  if (permanentRow) {
    await db.from('allowed_phones').update({ tariff }).eq('telefon_raqami', permanentRow.telefon_raqami)
    return
  }

  const rows = existingRows ?? []
  const latestExpiry = rows.reduce((max: number, r: { expires_at: string | null }) => {
    const t = r.expires_at ? new Date(r.expires_at).getTime() : 0
    return t > max ? t : max
  }, 0)
  const newExpiresAt = new Date(Math.max(now, latestExpiry) + durationMs).toISOString()

  if (rows.length > 0) {
    // Duplicate rows for the same phone (inconsistent formatting, entered by
    // hand historically) used to get the update applied to an arbitrary one,
    // leaving a row with a later original expiry stale while a shorter-lived
    // duplicate "won" the write. Always update whichever row already has the
    // latest expiry, and delete the other duplicates so they stop
    // accumulating.
    const sorted = [...rows].sort((a, b) => {
      const ta = a.expires_at ? new Date(a.expires_at).getTime() : 0
      const tb = b.expires_at ? new Date(b.expires_at).getTime() : 0
      return tb - ta
    })
    const [keep, ...stale] = sorted
    await db.from('allowed_phones').update({ expires_at: newExpiresAt, tariff }).eq('telefon_raqami', keep.telefon_raqami)
    for (const dupe of stale) {
      await db.from('allowed_phones').delete().eq('telefon_raqami', dupe.telefon_raqami)
    }
  } else {
    await db.from('allowed_phones').insert({ telefon_raqami: phone, expires_at: newExpiresAt, tariff })
  }
}
