import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getLast7Digits } from './phone.ts'

// Full access = phone is in allowed_phones AND not expired. expires_at is
// nullable: null means "never expires" (manual grants, added by hand for
// cash-paying students, keep working exactly as before). Paid-via-Multicard
// rows get a real expires_at set by payment-webhook.
//
// .limit(1) instead of .maybeSingle()/.single(): allowed_phones is filled in
// by hand and sometimes has the same number twice in different formats --
// both match the ilike pattern, and .maybeSingle() throws on >1 row.
export async function checkFullAccess(db: SupabaseClient, phone: string): Promise<boolean> {
  const last7 = getLast7Digits(phone)
  if (!last7) return false

  const { data: rows } = await db
    .from('allowed_phones')
    .select('expires_at')
    .ilike('telefon_raqami', `%${last7}`)
    .limit(5)

  if (!rows || rows.length === 0) return false
  const now = Date.now()
  return rows.some((r) => !r.expires_at || new Date(r.expires_at).getTime() > now)
}
