import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jvqnrzzkocslgwuminwf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cW5yenprb2NzbGd3dW1pbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDIzNDUsImV4cCI6MjA4MTkxODM0NX0.GEhZndZGdCM5JTQLCBVJ54XkreDnLqpUZk4RBsWjtbk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
