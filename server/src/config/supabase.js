import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.'
  )
}

/**
 * Server-side Supabase client.
 *
 * Uses the Service Role Key so it can bypass Row Level Security for
 * backend operations (storage writes, session inserts, etc.).
 *
 * ⚠️  Never expose this client — or the Service Role Key — to the browser.
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    // Disable automatic session persistence — this is a stateless API server
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

export default supabase
