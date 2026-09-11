import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for browser or edge server contexts.
 * Uses environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseClient(supabaseUrl?: string, supabaseAnonKey?: string) {
  const url =
    supabaseUrl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://jjtvvqrpaqxqvbhoylnb.supabase.co";
  const key =
    supabaseAnonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqdHZ2cXJwYXF4cXZiaG95bG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4OTgyOTksImV4cCI6MjEwNDQ3NDI5OX0.ZUhCFL2KELtjlx0pGCfblLuFz1iFNn1B6dzMe1P6CXE";

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
  const url =
    supabaseUrl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://jjtvvqrpaqxqvbhoylnb.supabase.co";
  const key =
    serviceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqdHZ2cXJwYXF4cXZiaG95bG5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg5ODI5OSwiZXhwIjoyMTA0NDc0Mjk5fQ.wdhTXNovnquxyT0I7pdyygj_d5PM2PuvwFc5ji3ehsM";

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
