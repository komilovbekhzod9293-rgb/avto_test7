import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Same env vars get-data already uses successfully to reach allowed_phones,
// lessons, topics, questions and answers -- reused here so new tables
// (app_users, topic_progress, user_stats, friendships) live in the same
// database and are reachable with the same already-configured secret.
export function createDb() {
  const url = Deno.env.get('EXTERNAL_SUPABASE_URL')
  const key = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY')
  if (!url || !key) {
    throw new Error('Server configuration error: EXTERNAL_SUPABASE_URL/EXTERNAL_SUPABASE_SERVICE_KEY missing')
  }
  return createClient(url, key)
}
