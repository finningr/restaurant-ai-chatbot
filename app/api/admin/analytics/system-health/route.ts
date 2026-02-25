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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // Default to 30 days
    const isAllTime = timeRange === 'all'
    const days = isAllTime ? 0 : parseInt(timeRange) || 30

    let startDate: Date | null = null
    if (!isAllTime) {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // 1. Database Health Check
    const dbHealthStart = Date.now()
    let dbHealthStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    let dbResponseTime = 0
    let dbError = null

    try {
      const { data, error } = await supabaseAdmin
        .from('restaurants')
        .select('id')
        .limit(1)

      dbResponseTime = Date.now() - dbHealthStart
      
      if (error) {
        dbError = error.message
        dbHealthStatus = 'down'
      } else if (dbResponseTime > 1000) {
        dbHealthStatus = 'degraded'
      }
    } catch (err: any) {
      dbError = err.message
      dbHealthStatus = 'down'
      dbResponseTime = Date.now() - dbHealthStart
    }

    // 2. Active Sessions Count
    let activeSessionsQuery = supabaseAdmin
      .from('active_sessions')
      .select('id', { count: 'exact', head: true })

    if (startDate) {
      activeSessionsQuery = activeSessionsQuery.gte('last_active', startDate.toISOString())
    }

    const { count: activeSessionsCount, error: activeSessionsError } = await activeSessionsQuery

    // 3. Total API Requests (from response_metrics)
    let apiRequestsQuery = supabaseAdmin
      .from('response_metrics')
      .select('id', { count: 'exact', head: true })

    if (startDate) {
      apiRequestsQuery = apiRequestsQuery.gte('timestamp', startDate.toISOString())
    }

    const { count: totalApiRequests, error: apiRequestsError } = await apiRequestsQuery

    // 4. Average Response Time (from response_metrics)
    let avgResponseTimeQuery = supabaseAdmin
      .from('response_metrics')
      .select('response_time_ms')

    if (startDate) {
      avgResponseTimeQuery = avgResponseTimeQuery.gte('timestamp', startDate.toISOString())
    }

    const { data: responseTimes, error: responseTimesError } = await avgResponseTimeQuery

    const avgResponseTime = responseTimes && responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum: number, r: any) => sum + (r.response_time_ms || 0), 0) / responseTimes.length)
      : 0

    // 5. Error Rate (from activity_log - look for error-related actions)
    let errorLogQuery = supabaseAdmin
      .from('activity_log')
      .select('id', { count: 'exact', head: true })
      .or('action_type.ilike.%error%,action_type.ilike.%fail%')

    if (startDate) {
      errorLogQuery = errorLogQuery.gte('timestamp', startDate.toISOString())
    }

    const { count: errorCount, error: errorLogError } = await errorLogQuery

    // 6. Total Activity (all activity_log entries)
    let totalActivityQuery = supabaseAdmin
      .from('activity_log')
      .select('id', { count: 'exact', head: true })

    if (startDate) {
      totalActivityQuery = totalActivityQuery.gte('timestamp', startDate.toISOString())
    }

    const { count: totalActivity, error: totalActivityError } = await totalActivityQuery

    const errorRate = totalActivity && totalActivity > 0
      ? Math.round((errorCount || 0) / totalActivity * 100 * 10) / 10 // Round to 1 decimal
      : 0

    // 7. User Login Sessions
    let loginSessionsQuery = supabaseAdmin
      .from('user_login_sessions')
      .select('id', { count: 'exact', head: true })

    if (startDate) {
      loginSessionsQuery = loginSessionsQuery.gte('login_time', startDate.toISOString())
    }

    const { count: totalLogins, error: loginSessionsError } = await loginSessionsQuery

    // 8. System Uptime (approximate - based on first activity log entry)
    const { data: firstActivity, error: firstActivityError } = await supabaseAdmin
      .from('activity_log')
      .select('timestamp')
      .order('timestamp', { ascending: true })
      .limit(1)

    const systemUptimeDays = firstActivity && firstActivity.length > 0
      ? Math.floor((Date.now() - new Date(firstActivity[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // 9. Recent Errors (last 10 error-related activities)
    const { data: recentErrors, error: recentErrorsError } = await supabaseAdmin
      .from('activity_log')
      .select('*')
      .or('action_type.ilike.%error%,action_type.ilike.%fail%')
      .order('timestamp', { ascending: false })
      .limit(10)

    // 10. API Endpoint Usage (from activity_log - group by action_type)
    let endpointUsageQuery = supabaseAdmin
      .from('activity_log')
      .select('action_type')

    if (startDate) {
      endpointUsageQuery = endpointUsageQuery.gte('timestamp', startDate.toISOString())
    }

    const { data: endpointData, error: endpointError } = await endpointUsageQuery

    const endpointUsage: Record<string, number> = {}
    endpointData?.forEach((item: any) => {
      const endpoint = item.action_type || 'unknown'
      endpointUsage[endpoint] = (endpointUsage[endpoint] || 0) + 1
    })

    // Sort endpoints by usage
    const topEndpoints = Object.entries(endpointUsage)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count: count as number }))

    // Calculate Overall System Health Score (0-100)
    let healthScore = 100
    const scoreBreakdown = {
      startingScore: 100,
      penalties: [] as Array<{ reason: string, points: number, severity: 'critical' | 'warning' | 'minor' }>,
      finalScore: 0
    }
    
    // Deduct points for issues and track each penalty
    if (dbHealthStatus === 'down') {
      healthScore -= 50
      scoreBreakdown.penalties.push({
        reason: `Database is DOWN (${dbError || 'Connection failed'})`,
        points: -50,
        severity: 'critical'
      })
    } else if (dbHealthStatus === 'degraded') {
      healthScore -= 20
      scoreBreakdown.penalties.push({
        reason: `Database status is DEGRADED`,
        points: -20,
        severity: 'warning'
      })
    }
    
    if (dbResponseTime > 2000) {
      healthScore -= 20
      scoreBreakdown.penalties.push({
        reason: `Database response time is very slow (${dbResponseTime}ms > 2000ms)`,
        points: -20,
        severity: 'warning'
      })
    } else if (dbResponseTime > 1000) {
      healthScore -= 10
      scoreBreakdown.penalties.push({
        reason: `Database response time is slow (${dbResponseTime}ms > 1000ms)`,
        points: -10,
        severity: 'minor'
      })
    }
    
    if (avgResponseTime > 5000) {
      healthScore -= 20
      scoreBreakdown.penalties.push({
        reason: `API response time is very slow (${avgResponseTime}ms > 5000ms)`,
        points: -20,
        severity: 'warning'
      })
    } else if (avgResponseTime > 2000) {
      healthScore -= 10
      scoreBreakdown.penalties.push({
        reason: `API response time is slow (${avgResponseTime}ms > 2000ms)`,
        points: -10,
        severity: 'minor'
      })
    }
    
    if (errorRate > 10) {
      healthScore -= 30
      scoreBreakdown.penalties.push({
        reason: `High error rate (${errorRate}% > 10%)`,
        points: -30,
        severity: 'critical'
      })
    } else if (errorRate > 5) {
      healthScore -= 15
      scoreBreakdown.penalties.push({
        reason: `Moderate error rate (${errorRate}% > 5%)`,
        points: -15,
        severity: 'warning'
      })
    } else if (errorRate > 1) {
      healthScore -= 5
      scoreBreakdown.penalties.push({
        reason: `Low error rate (${errorRate}% > 1%)`,
        points: -5,
        severity: 'minor'
      })
    }

    healthScore = Math.max(0, healthScore)
    scoreBreakdown.finalScore = healthScore

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (healthScore < 50) {
      overallStatus = 'critical'
    } else if (healthScore < 80) {
      overallStatus = 'degraded'
    }

    return NextResponse.json({
      systemHealth: {
        overallStatus,
        healthScore,
        scoreBreakdown,
        dbHealth: {
          status: dbHealthStatus,
          responseTime: dbResponseTime,
          error: dbError
        },
        apiMetrics: {
          totalRequests: totalApiRequests || 0,
          avgResponseTime,
          errorRate,
          activeSessions: activeSessionsCount || 0
        },
        activityMetrics: {
          totalActivity: totalActivity || 0,
          totalLogins: totalLogins || 0,
          systemUptimeDays
        },
        topEndpoints,
        recentErrors: recentErrors?.map((err: any) => ({
          timestamp: err.timestamp,
          action_type: err.action_type,
          user_email: err.user_email,
          details: err.details
        })) || []
      },
      timeRangeDays: days
    })

  } catch (error: any) {
    console.error('Error fetching system health:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

