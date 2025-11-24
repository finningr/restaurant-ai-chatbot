import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for browser-side operations
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Admin client for server-side operations (bypasses RLS)
// Created lazily to avoid build-time errors
let _supabaseAdmin = null

function createSupabaseAdmin() {
  // Skip during build time - Next.js sets this during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceRoleKey) {
    return null
  }
  
  try {
    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error)
    return null
  }
}

function getSupabaseAdmin() {
  if (_supabaseAdmin === null) {
    _supabaseAdmin = createSupabaseAdmin()
  }
  return _supabaseAdmin
}

// Export function for explicit usage
export { getSupabaseAdmin }

// For backward compatibility - create a getter object
// This will only initialize when actually used, not during module load
const supabaseAdminGetter = {
  get client() {
    return getSupabaseAdmin()
  }
}

// Export supabaseAdmin as a proxy that forwards all calls to the client
export const supabaseAdmin = new Proxy(supabaseAdminGetter, {
  get(target, prop) {
    if (prop === 'client') {
      return target.client
    }
    const client = target.client
    if (!client) {
      // Return safe defaults during build/runtime when Supabase isn't configured
      if (prop === 'from') {
        return () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      }
      return undefined
    }
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
