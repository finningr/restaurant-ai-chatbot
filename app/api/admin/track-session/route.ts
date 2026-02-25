import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/admin/track-session - Track active session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restaurantId, isActive, sessionType } = await request.json()
    const userEmail = session.user.email

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (isActive) {
      // Upsert active session
      // First try to update, if no rows affected then insert
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('active_sessions')
        .select('user_email')
        .eq('user_email', userEmail)
        .eq('restaurant_id', restaurantId)
        .maybeSingle()

      let error
      if (existing) {
        // Update existing
        const { error: updateError } = await supabaseAdmin
          .from('active_sessions')
          .update({
            session_type: sessionType || 'admin',
            last_active: new Date().toISOString(),
            ip_address: ipAddress,
            user_agent: userAgent
          })
          .eq('user_email', userEmail)
          .eq('restaurant_id', restaurantId)
        error = updateError
      } else {
        // Insert new
        const { error: insertError } = await supabaseAdmin
          .from('active_sessions')
          .insert({
            user_email: userEmail,
            restaurant_id: restaurantId,
            session_type: sessionType || 'admin',
            last_active: new Date().toISOString(),
            ip_address: ipAddress,
            user_agent: userAgent
          })
        error = insertError
      }

      if (error) {
        console.error('Error tracking session:', error)
        // Don't fail the request - session tracking is non-critical
        // Just log the error and continue
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 200 }) // Return 200 so it doesn't break the UI
      }
    } else {
      // Remove active session
      const { error } = await supabaseAdmin
        .from('active_sessions')
        .delete()
        .eq('user_email', userEmail)
        .eq('restaurant_id', restaurantId)

      if (error) {
        console.error('Error removing session:', error)
        // Don't fail if session doesn't exist
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in track-session route:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

