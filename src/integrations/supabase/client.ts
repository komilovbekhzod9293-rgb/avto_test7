import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ziqzprosgzevkdfwyotl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
