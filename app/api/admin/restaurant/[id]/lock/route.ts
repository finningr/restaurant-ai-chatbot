import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { logActivity, getClientIP, getUserAgent } from '@/lib/activity-logger'

export const dynamic = 'force-dynamic'

// POST /api/admin/restaurant/[id]/lock - Lock/unlock restaurant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const restaurantId = params.id
    const { lock } = await request.json()

    // Update lock status
    const updateData: any = {
      locked_by_admin: lock === true,
    }

    if (lock === true) {
      updateData.locked_at = new Date().toISOString()
    } else {
      updateData.locked_at = null
    }

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating lock status:', error)
      return NextResponse.json({ 
        error: 'Failed to update lock status' 
      }, { status: 500 })
    }

    // Log activity
    await logActivity({
      user_email: session.user.email!,
      user_role: 'admin',
      action_type: lock ? 'lock_restaurant' : 'unlock_restaurant',
      restaurant_id: restaurantId,
      restaurant_name: data.name,
      details: { locked: lock },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request)
    })

    return NextResponse.json({ 
      success: true,
      restaurant: data
    })

  } catch (error) {
    console.error('Error in lock route:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

