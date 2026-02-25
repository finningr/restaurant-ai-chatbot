import { supabaseAdmin } from './supabase'

export interface ActivityLogEntry {
  user_email: string
  user_role: string
  action_type: string
  restaurant_id?: string
  restaurant_name?: string
  details?: any
  ip_address?: string
  user_agent?: string
}

export async function logActivity(entry: ActivityLogEntry) {
  try {
    const { error } = await supabaseAdmin
      .from('activity_log')
      .insert({
        user_email: entry.user_email,
        user_role: entry.user_role,
        action_type: entry.action_type,
        restaurant_id: entry.restaurant_id || null,
        restaurant_name: entry.restaurant_name || null,
        details: entry.details || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging activity:', error)
      // Don't throw - activity logging shouldn't break main functionality
    }
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - activity logging shouldn't break main functionality
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

