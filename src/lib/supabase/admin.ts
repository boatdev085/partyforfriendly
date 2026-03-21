import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Supabase admin client — uses the service role key, bypasses RLS.
 * Only use server-side (API routes, server actions, NextAuth callbacks).
 * Never expose to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
