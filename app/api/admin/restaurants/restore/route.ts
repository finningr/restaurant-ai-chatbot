import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { logActivity, getClientIP, getUserAgent } from '@/lib/activity-logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { restaurantId } = await request.json()

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Restore: Clear deleted_at timestamp
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update({ deleted_at: null })
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) {
      console.error('Error restoring restaurant:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await logActivity({
      user_email: session.user.email,
      user_role: 'admin',
      action_type: 'restore_restaurant',
      restaurant_id: restaurantId,
      restaurant_name: data.name,
      details: { restored: true },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request)
    })

    return NextResponse.json({
      success: true,
      restaurant: data,
      message: 'Restaurant restored successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



