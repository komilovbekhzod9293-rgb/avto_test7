import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a typed client for the database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'question-images';
export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}`;

export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${STORAGE_URL}/${imagePath}`;
}
