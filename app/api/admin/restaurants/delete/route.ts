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

    // Get restaurant name before delete for activity log
    const { data: existing } = await supabaseAdmin
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Permanent delete – cascade will remove menu_items, chatbot_settings, conversation_logs, etc.
    const { error } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', restaurantId)

    if (error) {
      console.error('Error deleting restaurant:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log activity
    await logActivity({
      user_email: session.user.email,
      user_role: 'admin',
      action_type: 'delete_restaurant',
      restaurant_id: restaurantId,
      restaurant_name: existing.name,
      details: { permanent: true },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request)
    })

    return NextResponse.json({
      success: true,
      message: 'Restaurant permanently deleted'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



