import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Real client initialization
let realClient: any = null;
if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
  try {
    realClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error("Supabase init error:", error);
  }
}

// Proxy to prevent crashes when env vars are missing or slow to load
export const supabase = new Proxy({} as any, {
  get(target, prop: string) {
    if (prop === 'isInitialized') return !!realClient;

    // If client is ready, return real property
    if (realClient) return realClient[prop];

    // Log warning if accessing while uninitialized
    console.warn(`Supabase accessed before initialization: supabase.${prop}`);

    // Safe fallbacks for auth methods
    if (prop === 'auth') {
      return {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({ error: new Error("Supabase not initialized") }),
        signInWithPassword: async () => ({ error: new Error("Supabase not initialized") }),
        signUp: async () => ({ error: new Error("Supabase not initialized") }),
        signOut: async () => {},
      };
    }

    // Safe fallbacks for data methods
    if (prop === 'from' || prop === 'rpc') {
      return () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
          }),
          order: () => ({
            limit: () => (async () => ({ data: [], error: null })),
          }),
        }),
        insert: () => (async () => ({ data: null, error: null })),
        update: () => ({
          eq: () => (async () => ({ data: null, error: null })),
        }),
      });
    }

    // Default for anything else
    return undefined;
  }
});