import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

// Single server-side client, used by every API route. Uses the service-role key
// (full trust, no row-level security) to match the previous Mongoose access pattern
// where every route had unrestricted access to the database. Lazily created so a
// missing env var only throws when a route actually runs, not at module-import time
// (mirrors the old connectDB() behavior in src/lib/mongodb.ts).
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE тохиргоо дутуу байна: NEXT_PUBLIC_SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY-г .env.local-д тохируулна уу.'
    );
  }

  cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
