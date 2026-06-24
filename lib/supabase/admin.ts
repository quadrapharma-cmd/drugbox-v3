import { createClient } from '@supabase/supabase-js'

// ⚠️ SERVER-ONLY. This client uses the SERVICE ROLE KEY which bypasses RLS.
// It must NEVER be imported into a Client Component or shipped to the browser.
// Used only for: seeding, admin tasks, and trusted server-side operations
// that legitimately need to bypass row-level security.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
