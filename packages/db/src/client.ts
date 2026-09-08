import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for browser or edge server contexts.
 * Uses environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseClient(supabaseUrl?: string, supabaseAnonKey?: string) {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    console.warn("Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Creates a Supabase Service Role client for administrative server-side operations.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser!
 */
export function getSupabaseAdminClient(supabaseUrl?: string, serviceRoleKey?: string) {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    console.warn("Supabase Admin credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
