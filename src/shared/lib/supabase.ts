import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in dev/build if env is missing so we never ship an unconfigured client.
  throw new Error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Supabase manages the session in localStorage and auto-refreshes the JWT.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
