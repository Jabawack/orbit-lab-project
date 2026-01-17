import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase credentials not configured. Flight history will not be saved.');
}

// Use generic client without strict types for flexibility
export const supabase: SupabaseClient | null = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
