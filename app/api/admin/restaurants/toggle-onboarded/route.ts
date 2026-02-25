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

    const { restaurantId, isOnboarded } = await request.json()

    if (!restaurantId || typeof isOnboarded !== 'boolean') {
      return NextResponse.json(
        { error: 'Restaurant ID and isOnboarded status are required' },
        { status: 400 }
      )
    }

    // Get restaurant data first for logging
    const { data: restaurant, error: fetchError } = await supabaseAdmin
      .from('restaurants')
      .select('name, owner_email')
      .eq('id', restaurantId)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Update onboarding status and sync is_active
    // When onboarding: set is_onboarded=true, is_active=true
    // When un-onboarding: set is_onboarded=false, is_active=false
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update({ 
        is_onboarded: isOnboarded,
        is_active: isOnboarded  // Sync active status with onboarding
      })
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating onboarding status:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await logActivity({
      user_email: session.user.email,
      user_role: 'admin',
      action_type: isOnboarded ? 'mark_onboarded' : 'mark_unonboarded',
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
      details: { 
        is_onboarded: isOnboarded,
        has_owner_email: !!restaurant.owner_email,
        manual_override: true
      },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request)
    })

    return NextResponse.json({
      success: true,
      restaurant: data,
      message: isOnboarded ? 'Restaurant marked as onboarded' : 'Restaurant marked as demo'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

