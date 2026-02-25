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

    // Get currently active sessions
    const { data: activeSessions, error: activeError } = await supabaseAdmin
      .from('active_sessions')
      .select('*')
      .order('last_active', { ascending: false })

    if (activeError) {
      console.error('Error fetching active sessions:', activeError)
    }

    // Get recent login sessions based on time range
    let loginQuery = supabaseAdmin
      .from('user_login_sessions')
      .select('*')
      .order('login_time', { ascending: false })
      .limit(1000)

    if (!isAllTime) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      loginQuery = loginQuery.gte('login_time', startDate.toISOString())
    }

    const { data: loginSessions, error: loginError } = await loginQuery

    if (loginError) {
      console.error('Error fetching login sessions:', loginError)
    }

    // Aggregate stats by user
    const userStats: Record<string, {
      email: string
      totalLogins: number
      lastLogin: string | null
      totalSessionTime: number
      averageSessionTime: number
      isActive: boolean
      lastActive: string | null
      restaurantId: string | null
      sessionType: string | null
    }> = {}

    // Process login sessions
    if (loginSessions) {
      loginSessions.forEach((session: any) => {
        const email = session.user_email
        if (!userStats[email]) {
          userStats[email] = {
            email,
            totalLogins: 0,
            lastLogin: null,
            totalSessionTime: 0,
            averageSessionTime: 0,
            isActive: false,
            lastActive: null,
            restaurantId: null,
            sessionType: null
          }
        }
        userStats[email].totalLogins++
        if (!userStats[email].lastLogin || session.login_time > userStats[email].lastLogin!) {
          userStats[email].lastLogin = session.login_time
        }
        if (session.session_duration_minutes) {
          userStats[email].totalSessionTime += session.session_duration_minutes
        }
      })
    }

    // Process active sessions
    if (activeSessions) {
      activeSessions.forEach((session: any) => {
        const email = session.user_email
        if (!userStats[email]) {
          userStats[email] = {
            email,
            totalLogins: 0,
            lastLogin: null,
            totalSessionTime: 0,
            averageSessionTime: 0,
            isActive: false,
            lastActive: null,
            restaurantId: null,
            sessionType: null
          }
        }
        userStats[email].isActive = true
        userStats[email].lastActive = session.last_active
        userStats[email].restaurantId = session.restaurant_id
        userStats[email].sessionType = session.session_type
      })
    }

    // Calculate averages
    Object.values(userStats).forEach(stat => {
      if (stat.totalLogins > 0) {
        stat.averageSessionTime = Math.round(stat.totalSessionTime / stat.totalLogins)
      }
    })

    return NextResponse.json({
      activeSessions: activeSessions || [],
      loginSessions: loginSessions || [],
      userStats: Object.values(userStats),
      summary: {
        totalActiveUsers: activeSessions?.length || 0,
        totalLoginsLast30Days: loginSessions?.length || 0,
        uniqueUsersLast30Days: Object.keys(userStats).length,
        timeRangeDays: days
      }
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
