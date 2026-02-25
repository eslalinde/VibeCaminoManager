import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function clearStaleAuthData() {
  if (typeof window === 'undefined') return
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => localStorage.removeItem(k))
  } catch {
    // localStorage unavailable
  }
}

export function createClient() {
  if (!client) {
    // Clear stale auth data from previous package versions
    clearStaleAuthData()

    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        auth: {
          // Bypass Navigator LockManager which can hang indefinitely.
          // Safe because this is a singleton — no concurrent access.
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn()
          },
        },
      }
    )
  }
  return client
}
