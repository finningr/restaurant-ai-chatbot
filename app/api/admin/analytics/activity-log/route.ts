import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get time range from query params (default: 30 days)
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30'
    const isAllTime = timeRange === 'all'
    const days = isAllTime ? 0 : parseInt(timeRange) || 30
    const actionType = searchParams.get('actionType') || null
    const userRoleFilter = searchParams.get('userRole') || null

    let query = supabaseAdmin
      .from('activity_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500)

    if (!isAllTime) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      query = query.gte('timestamp', startDate.toISOString())
    }

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    if (userRoleFilter) {
      query = query.eq('user_role', userRoleFilter)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Error fetching activity log:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch activity log' 
      }, { status: 500 })
    }

    // Aggregate stats
    const stats = {
      totalActions: activities?.length || 0,
      byActionType: {} as Record<string, number>,
      byUserRole: {} as Record<string, number>,
      byUser: {} as Record<string, number>
    }

    activities?.forEach((activity: any) => {
      // Count by action type
      stats.byActionType[activity.action_type] = 
        (stats.byActionType[activity.action_type] || 0) + 1
      
      // Count by user role
      stats.byUserRole[activity.user_role] = 
        (stats.byUserRole[activity.user_role] || 0) + 1
      
      // Count by user
      stats.byUser[activity.user_email] = 
        (stats.byUser[activity.user_email] || 0) + 1
    })

    return NextResponse.json({
      activities: activities || [],
      stats,
      timeRangeDays: days
    })

  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

