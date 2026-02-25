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
    console.error('⚠️ Supabase Admin Client: Missing configuration', {
      hasUrl: !!url,
      hasServiceRoleKey: !!serviceRoleKey,
      urlLength: url?.length || 0,
      keyLength: serviceRoleKey?.length || 0
    })
    return null
  }
  
  try {
    const client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('✅ Supabase Admin Client created successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to create Supabase admin client:', error)
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
          return () => {
            const mockPromise: Promise<any> = Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            // Ensure the mock promise has catch method
            return {
              select: () => mockPromise,
              insert: (data: any) => mockPromise,
              update: () => mockPromise,
              delete: () => mockPromise,
              upsert: () => mockPromise,
              eq: () => ({ 
                select: () => mockPromise, 
                insert: () => mockPromise,
                maybeSingle: () => mockPromise,
                single: () => mockPromise
              }),
              maybeSingle: () => mockPromise,
              single: () => mockPromise
            }
          }
        }
        // Return undefined for other properties
        return undefined
      }
      // When client exists, return the actual property value directly
      // This ensures all methods and properties work correctly with chaining
      return (client as any)[prop]
    }
  }
  
  // Create a dummy object that will be replaced by the proxy
  return new Proxy({} as SupabaseClient, handler)
}

// Export supabaseAdmin as a typed proxy
export const supabaseAdmin: SupabaseClient = createSupabaseAdminProxy()

