/**
 * Cookie-free Supabase client for public (anonymous) data fetching.
 *
 * Unlike the standard server client in `server.ts`, this one does NOT call
 * `cookies()`, which means pages that use it can be statically generated
 * or cached with ISR instead of being forced into dynamic rendering.
 *
 * Use this client ONLY for read-only public queries that don't need auth context.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let _client: ReturnType<typeof createSupabaseClient> | null = null;

export function createPublicClient() {
  if (_client) return _client;

  _client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false },
    }
  );

  return _client;
}
