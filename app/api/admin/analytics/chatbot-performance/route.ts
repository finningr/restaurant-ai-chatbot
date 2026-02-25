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

    // Calculate date range
    let startDate: Date | null = null
    if (!isAllTime) {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // Get conversation logs
    let conversationsQuery = supabaseAdmin
      .from('conversation_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (!isAllTime && startDate) {
      conversationsQuery = conversationsQuery.gte('timestamp', startDate.toISOString())
    }

    const { data: conversations, error: conversationsError } = await conversationsQuery.limit(10000)

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json({ 
        error: 'Failed to fetch conversations' 
      }, { status: 500 })
    }

    // Get response metrics
    let metricsQuery = supabaseAdmin
      .from('response_metrics')
      .select('*')
      .order('timestamp', { ascending: false })

    if (!isAllTime && startDate) {
      metricsQuery = metricsQuery.gte('timestamp', startDate.toISOString())
    }

    const { data: metrics, error: metricsError } = await metricsQuery.limit(10000)

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError)
    }

    // Get restaurant names
    const restaurantIds = Array.from(new Set(conversations?.map((c: any) => c.restaurant_id).filter(Boolean) || []))
    const { data: restaurants } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, widget_id')
      .in('id', restaurantIds)

    const restaurantMap = new Map(restaurants?.map((r: any) => [r.id, r]) || [])

    // Aggregate stats by restaurant
    const restaurantStats: Record<string, {
      restaurant_id: string
      restaurant_name: string
      widget_id: string
      totalMessages: number
      totalConversations: number
      avgResponseTime: number
      uniqueSessions: number
      popularMenuItems: Record<string, number>
      conversationCompletionRate: number
      totalFeedback: number
      positiveFeedback: number
      negativeFeedback: number
      satisfactionRate: number
    }> = {}

    // Process conversations
    const sessionMap = new Map<string, Set<string>>() // restaurant_id -> Set of session_ids
    const menuItemCounts: Record<string, Record<string, number>> = {} // restaurant_id -> menu_item -> count
    const completedSessions: Record<string, Set<string>> = {} // restaurant_id -> Set of completed session_ids

    conversations?.forEach((conv: any) => {
      const restaurantId = conv.restaurant_id
      if (!restaurantId) return

      const restaurant = restaurantMap.get(restaurantId)
      if (!restaurant) return

      if (!restaurantStats[restaurantId]) {
        restaurantStats[restaurantId] = {
          restaurant_id: restaurantId,
          restaurant_name: restaurant.name,
          widget_id: restaurant.widget_id,
          totalMessages: 0,
          totalConversations: 0,
          avgResponseTime: 0,
          uniqueSessions: 0,
          popularMenuItems: {},
          conversationCompletionRate: 0,
          totalFeedback: 0,
          positiveFeedback: 0,
          negativeFeedback: 0,
          satisfactionRate: 0
        }
      }

      restaurantStats[restaurantId].totalMessages++

      // Track feedback
      if (conv.feedback_score !== null && conv.feedback_score !== undefined) {
        restaurantStats[restaurantId].totalFeedback++
        if (conv.feedback_score === 1) {
          restaurantStats[restaurantId].positiveFeedback++
        } else if (conv.feedback_score === -1) {
          restaurantStats[restaurantId].negativeFeedback++
        }
      }

      // Track unique sessions
      if (!sessionMap.has(restaurantId)) {
        sessionMap.set(restaurantId, new Set())
      }
      sessionMap.get(restaurantId)!.add(conv.session_id)

      // Track menu items mentioned
      if (conv.menu_items_mentioned && Array.isArray(conv.menu_items_mentioned)) {
        if (!menuItemCounts[restaurantId]) {
          menuItemCounts[restaurantId] = {}
        }
        conv.menu_items_mentioned.forEach((item: string) => {
          menuItemCounts[restaurantId][item] = (menuItemCounts[restaurantId][item] || 0) + 1
        })
      }

      // Track completed conversations
      if (conv.conversation_completed) {
        if (!completedSessions[restaurantId]) {
          completedSessions[restaurantId] = new Set()
        }
        completedSessions[restaurantId].add(conv.session_id)
      }
    })

    // Process response metrics
    const responseTimesByRestaurant: Record<string, number[]> = {}
    metrics?.forEach((metric: any) => {
      if (!metric.restaurant_id || !metric.response_time_ms) return
      
      if (!responseTimesByRestaurant[metric.restaurant_id]) {
        responseTimesByRestaurant[metric.restaurant_id] = []
      }
      responseTimesByRestaurant[metric.restaurant_id].push(metric.response_time_ms)
    })

    // Calculate final stats
    Object.values(restaurantStats).forEach(stat => {
      const restaurantId = stat.restaurant_id
      
      // Unique sessions
      stat.uniqueSessions = sessionMap.get(restaurantId)?.size || 0
      stat.totalConversations = stat.uniqueSessions

      // Average response time
      const responseTimes = responseTimesByRestaurant[restaurantId] || []
      if (responseTimes.length > 0) {
        stat.avgResponseTime = Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        )
      }

      // Popular menu items (top 5)
      const menuItems = menuItemCounts[restaurantId] || {}
      const sortedItems = Object.entries(menuItems)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [item, count]) => {
          acc[item] = count
          return acc
        }, {} as Record<string, number>)
      stat.popularMenuItems = sortedItems

      // Conversation completion rate
      const completed = completedSessions[restaurantId]?.size || 0
      const total = stat.uniqueSessions || 1
      stat.conversationCompletionRate = Math.round((completed / total) * 100)

      // Satisfaction rate (positive feedback / total feedback)
      if (stat.totalFeedback > 0) {
        stat.satisfactionRate = Math.round((stat.positiveFeedback / stat.totalFeedback) * 100)
      }
    })

    // Calculate summary stats
    const allStats = Object.values(restaurantStats)
    const totalFeedbackCount = conversations?.filter((c: any) => c.feedback_score !== null && c.feedback_score !== undefined).length || 0
    const totalPositiveFeedback = conversations?.filter((c: any) => c.feedback_score === 1).length || 0
    const totalNegativeFeedback = conversations?.filter((c: any) => c.feedback_score === -1).length || 0
    const overallSatisfactionRate = totalFeedbackCount > 0 
      ? Math.round((totalPositiveFeedback / totalFeedbackCount) * 100)
      : 0

    const summary = {
      totalRestaurants: Object.keys(restaurantStats).length,
      totalMessages: conversations?.length || 0,
      totalConversations: Object.values(restaurantStats).reduce((sum, stat) => sum + stat.uniqueSessions, 0),
      avgResponseTime: metrics && metrics.length > 0
        ? Math.round(metrics.reduce((sum: number, m: any) => sum + (m.response_time_ms || 0), 0) / metrics.length)
        : 0,
      totalSessions: new Set(conversations?.map((c: any) => c.session_id) || []).size,
      totalFeedback: totalFeedbackCount,
      totalPositiveFeedback,
      totalNegativeFeedback,
      overallSatisfactionRate
    }

    return NextResponse.json({
      restaurantStats: Object.values(restaurantStats).sort((a, b) => b.totalMessages - a.totalMessages),
      summary,
      timeRangeDays: days
    })

  } catch (error) {
    console.error('Error fetching chatbot performance:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

