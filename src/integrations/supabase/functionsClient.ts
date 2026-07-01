import { createClient } from '@supabase/supabase-js';

// All edge functions (get-data, auth-register, auth-login, session-check,
// progress-sync-v2, friends, avatar-upload) plus allowed_phones/lessons/topics/
// questions/answers/app_users live in this project. Kept separate from
// '@/integrations/supabase/client' (a different project this app's owner
// doesn't administer) so functions.invoke() resolves to the right place.
const FUNCTIONS_SUPABASE_URL = 'https://ziqzprosgzevkdfwyotl.supabase.co';
const FUNCTIONS_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU';

export const functionsSupabase = createClient(FUNCTIONS_SUPABASE_URL, FUNCTIONS_SUPABASE_ANON_KEY);

// supabase-js treats any non-2xx response from an edge function as an
// `error` (FunctionsHttpError) and does NOT populate `data` -- our functions
// always return a JSON body like { error: 'device_mismatch' } even on 4xx/5xx,
// so read it from `error.context` instead of assuming `data.error` is set.
export async function invokeFunction<T = any>(
  name: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await functionsSupabase.functions.invoke(name, { body });

  if (error) {
    let code: string | null = null;
    try {
      const parsed = await error.context?.json?.();
      code = parsed?.error ?? null;
    } catch {
      code = null;
    }
    return { data: null, error: code ?? 'network_error' };
  }

  const payload = data?.data ?? data;
  return { data: payload ?? null, error: data?.error ?? null };
}
