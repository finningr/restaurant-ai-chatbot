import { createClient, SupabaseClient } from '@supabase/supabase-js'
import path from 'path'

// Force load .env.local - Next.js sometimes doesn't expose these to API routes
if (typeof window === 'undefined') {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
}

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceRoleKey) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('⚠️ Supabase Admin Client: Missing configuration', {
        hasUrl: !!url,
        hasServiceRoleKey: !!serviceRoleKey,
        varNames: 'Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      })
    }
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
            const chainable = {
              eq: () => chainable,
              is: () => chainable,
              or: () => chainable,
              maybeSingle: () => mockPromise,
              single: () => mockPromise,
              select: () => chainable,
            }
            return {
              select: () => chainable,
              insert: () => ({ select: () => ({ single: () => mockPromise }), single: () => mockPromise }),
              update: () => chainable,
              delete: () => chainable,
              upsert: () => chainable,
              eq: () => chainable,
              maybeSingle: () => mockPromise,
              single: () => mockPromise,
            }
          }
        }
        // Return undefined for other properties
        return undefined
      }
      // When client exists, return the actual property - bind methods to preserve `this`
      const value = (client as any)[prop]
      if (prop === 'from' && typeof value === 'function') {
        return value.bind(client)
      }
      return value
    }
  }
  
  // Create a dummy object that will be replaced by the proxy
  return new Proxy({} as SupabaseClient, handler)
}

// Export supabaseAdmin as a typed proxy
export const supabaseAdmin: SupabaseClient = createSupabaseAdminProxy()

