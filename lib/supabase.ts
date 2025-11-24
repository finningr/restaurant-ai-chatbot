import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for browser-side operations
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Admin client for server-side operations (bypasses RLS)
// Created lazily to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null

function createSupabaseAdmin(): SupabaseClient | null {
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

function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdmin === null) {
    _supabaseAdmin = createSupabaseAdmin()
  }
  return _supabaseAdmin
}

// Export function for explicit usage
export { getSupabaseAdmin }

// Create a proxy that forwards all method calls to the client
// This allows lazy initialization while maintaining the same API
const createSupabaseAdminProxy = (): SupabaseClient => {
  const handler: ProxyHandler<SupabaseClient> = {
    get(target, prop) {
      const client = getSupabaseAdmin()
      if (!client) {
        // During build time or when not configured, return safe defaults
        if (prop === 'from') {
          return () => ({
            select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        }
        // Return undefined for other properties
        return undefined
      }
      const value = (client as any)[prop]
      return typeof value === 'function' ? value.bind(client) : value
    }
  }
  
  // Create a dummy object that will be replaced by the proxy
  return new Proxy({} as SupabaseClient, handler)
}

// Export supabaseAdmin as a typed proxy
export const supabaseAdmin: SupabaseClient = createSupabaseAdminProxy()

