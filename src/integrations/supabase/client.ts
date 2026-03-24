import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-safe initialization to prevent "Blank Page" crashes if env vars are missing
let supabaseClient: any = null;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("CRITICAL: Supabase URL or Anon Key is missing! Please check your environment variables or GitHub Secrets.");
} else {
  try {
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error("FAILED to initialize Supabase client:", error);
  }
}

export const supabase = supabaseClient;