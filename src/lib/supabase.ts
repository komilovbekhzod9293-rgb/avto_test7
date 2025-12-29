import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// ✅ ВАША РАБОЧАЯ БАЗА ДАННЫХ
const supabaseUrl = 'https://ziqzprosgzevkdfwyotl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'question-images';
export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}`;

export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${STORAGE_URL}/${imagePath}`;
}
