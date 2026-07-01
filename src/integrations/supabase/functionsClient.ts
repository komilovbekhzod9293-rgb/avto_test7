import { createClient } from '@supabase/supabase-js';

// All edge functions (get-data, auth-register, auth-login, session-check,
// progress-sync, friends, avatar-upload) plus allowed_phones/lessons/topics/
// questions/answers/app_users live in this project. Kept separate from
// '@/integrations/supabase/client' (a different project this app's owner
// doesn't administer) so functions.invoke() resolves to the right place.
const FUNCTIONS_SUPABASE_URL = 'https://ziqzprosgzevkdfwyotl.supabase.co';
const FUNCTIONS_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU';

export const functionsSupabase = createClient(FUNCTIONS_SUPABASE_URL, FUNCTIONS_SUPABASE_ANON_KEY);
