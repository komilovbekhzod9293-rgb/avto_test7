import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// allowed_phones, lessons, topics, questions, answers and the new
// app_users/topic_progress/user_stats/friendships tables all live in this
// same project, so the auto-injected SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
// (available to every edge function for its own project, no manual secret
// setup needed) is the right client -- no separate "external" project.
export function createDb() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    throw new Error('Server configuration error: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing')
  }
  return createClient(url, key)
}
