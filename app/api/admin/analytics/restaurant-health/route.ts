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

    // Fetch all restaurants (including inactive for health monitoring)
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, widget_id, is_active, is_onboarded, owner_email, created_at, phone, email, address_street, address_city, address_state, address_zip, hours, description, cuisine, price_range, website_url')
      .is('deleted_at', null)

    if (restaurantsError) {
      console.error('Error fetching restaurants for restaurant health:', restaurantsError)
      return NextResponse.json({ error: 'Failed to fetch restaurants', details: restaurantsError.message }, { status: 500 })
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({
        restaurantHealth: [],
        summary: {
          total_restaurants: 0,
          healthy_count: 0,
          needs_attention_count: 0,
          critical_count: 0,
          avg_health_score: 0,
          avg_completeness_score: 0,
          avg_engagement_score: 0
        },
        timeRangeDays: days
      })
    }

    // Fetch menu items for all restaurants
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('restaurant_id, available')
      .is('deleted_at', null)

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
    }

    // Group menu items by restaurant
    const menuItemsByRestaurant = new Map<string, { total: number, available: number }>()
    menuItems?.forEach((item: any) => {
      if (!menuItemsByRestaurant.has(item.restaurant_id)) {
        menuItemsByRestaurant.set(item.restaurant_id, { total: 0, available: 0 })
      }
      const counts = menuItemsByRestaurant.get(item.restaurant_id)!
      counts.total++
      if (item.available) {
        counts.available++
      }
    })

    // Fetch conversation logs for engagement metrics
    const restaurantIds = restaurants?.map(r => r.id) || []
    
    let conversations: any[] = []
    if (restaurantIds.length > 0) {
      let conversationsQuery = supabaseAdmin
        .from('conversation_logs')
        .select('restaurant_id, session_id, conversation_completed, timestamp')
        .in('restaurant_id', restaurantIds)

      if (startDate) {
        conversationsQuery = conversationsQuery.gte('timestamp', startDate.toISOString())
      }

      const { data: convData, error: convError } = await conversationsQuery

      if (convError) {
        console.error('Error fetching conversation logs:', convError)
      } else {
        conversations = convData || []
      }
    }

    // Aggregate conversation data by restaurant
    const conversationsByRestaurant = new Map<string, {
      totalMessages: number
      uniqueSessions: Set<string>
      completedSessions: Set<string>
      lastActivity: Date | null
    }>()

    conversations?.forEach((conv: any) => {
      if (!conversationsByRestaurant.has(conv.restaurant_id)) {
        conversationsByRestaurant.set(conv.restaurant_id, {
          totalMessages: 0,
          uniqueSessions: new Set(),
          completedSessions: new Set(),
          lastActivity: null
        })
      }
      const stats = conversationsByRestaurant.get(conv.restaurant_id)!
      stats.totalMessages++
      stats.uniqueSessions.add(conv.session_id)
      if (conv.conversation_completed) {
        stats.completedSessions.add(conv.session_id)
      }
      const convDate = new Date(conv.timestamp)
      if (!stats.lastActivity || convDate > stats.lastActivity) {
        stats.lastActivity = convDate
      }
    })

    // Calculate health scores for each restaurant
    const restaurantHealth = restaurants?.map((restaurant: any) => {
      if (!restaurant || !restaurant.id) {
        console.warn('Skipping invalid restaurant:', restaurant)
        return null
      }

      const menuCounts = menuItemsByRestaurant.get(restaurant.id) || { total: 0, available: 0 }
      const convStats = conversationsByRestaurant.get(restaurant.id) || {
        totalMessages: 0,
        uniqueSessions: new Set(),
        completedSessions: new Set(),
        lastActivity: null
      }

      // Data Completeness Score (0-100) with detailed breakdown
      let completenessScore = 0
      const completenessFactors = {
        name: { points: restaurant.name ? 5 : 0, maxPoints: 5, hasValue: !!restaurant.name },
        description: { points: restaurant.description ? 5 : 0, maxPoints: 5, hasValue: !!restaurant.description },
        phone: { points: restaurant.phone ? 10 : 0, maxPoints: 10, hasValue: !!restaurant.phone },
        email: { points: restaurant.email ? 10 : 0, maxPoints: 10, hasValue: !!restaurant.email },
        address: { points: (restaurant.address_street && restaurant.address_city && restaurant.address_state) ? 10 : 0, maxPoints: 10, hasValue: !!(restaurant.address_street && restaurant.address_city && restaurant.address_state) },
        hours: { points: restaurant.hours ? 10 : 0, maxPoints: 10, hasValue: !!restaurant.hours },
        cuisine: { points: restaurant.cuisine ? 5 : 0, maxPoints: 5, hasValue: !!restaurant.cuisine },
        priceRange: { points: restaurant.price_range ? 5 : 0, maxPoints: 5, hasValue: !!restaurant.price_range },
        websiteUrl: { points: restaurant.website_url ? 5 : 0, maxPoints: 5, hasValue: !!restaurant.website_url },
        menuItems: { points: menuCounts.total > 0 ? 15 : 0, maxPoints: 15, hasValue: menuCounts.total > 0, count: menuCounts.total },
        ownerEmail: { points: restaurant.owner_email ? 20 : 0, maxPoints: 20, hasValue: !!restaurant.owner_email } // Important for onboarding
      }
      completenessScore = Object.values(completenessFactors).reduce((sum, val) => sum + val.points, 0)

      // Engagement Score (0-100) with detailed breakdown
      let engagementScore = 0
      const uniqueSessions = convStats.uniqueSessions.size
      const completedSessions = convStats.completedSessions.size
      const totalMessages = convStats.totalMessages
      const completionRate = uniqueSessions > 0 ? completedSessions / uniqueSessions : 0
      
      const engagementBreakdown = {
        sessionPoints: 0,
        maxSessionPoints: 50,
        completionPoints: 0,
        maxCompletionPoints: 30,
        messageVolumePoints: 0,
        maxMessageVolumePoints: 20
      }
      
      if (uniqueSessions > 0) {
        // Base engagement from having conversations
        engagementBreakdown.sessionPoints = Math.min(uniqueSessions * 10, 50) // Up to 50 points for sessions
        engagementScore += engagementBreakdown.sessionPoints
        
        // Completion rate (up to 30 points)
        engagementBreakdown.completionPoints = completionRate * 30
        engagementScore += engagementBreakdown.completionPoints
        
        // Message volume (up to 20 points)
        const avgMessagesPerSession = totalMessages / uniqueSessions
        engagementBreakdown.messageVolumePoints = Math.min(avgMessagesPerSession * 5, 20)
        engagementScore += engagementBreakdown.messageVolumePoints
      }

      // Overall Health Score (weighted average)
      const overallHealthScore = Math.round(
        (completenessScore * 0.6) + (engagementScore * 0.4)
      )

      // Determine Health Status
      let healthStatus: 'healthy' | 'needs_attention' | 'critical' = 'healthy'
      let statusColor = 'green'
      
      if (overallHealthScore < 40) {
        healthStatus = 'critical'
        statusColor = 'red'
      } else if (overallHealthScore < 70) {
        healthStatus = 'needs_attention'
        statusColor = 'yellow'
      }

      // Generate Recommendations
      const recommendations: string[] = []
      
      if (!restaurant.phone) recommendations.push('Add phone number')
      if (!restaurant.email) recommendations.push('Add email address')
      if (!restaurant.address_street) recommendations.push('Add complete address')
      if (!restaurant.hours) recommendations.push('Add business hours')
      if (menuCounts.total === 0) recommendations.push('Add menu items')
      if (!restaurant.owner_email) recommendations.push('Complete onboarding')
      if (uniqueSessions === 0 && restaurant.is_active) recommendations.push('Promote chatbot on website')
      if (completionRate < 0.3 && uniqueSessions > 0) recommendations.push('Improve chatbot responses to increase completion rate')

      // Days since last activity
      const daysSinceLastActivity = convStats.lastActivity
        ? Math.floor((Date.now() - convStats.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null

      // Days since creation
      const daysSinceCreation = restaurant.created_at
        ? Math.floor(
            (Date.now() - new Date(restaurant.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0

      return {
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        widget_id: restaurant.widget_id,
        is_active: restaurant.is_active,
        is_onboarded: restaurant.is_onboarded,
        owner_email: restaurant.owner_email,
        completeness_score: completenessScore,
        engagement_score: Math.round(engagementScore),
        overall_health_score: overallHealthScore,
        health_status: healthStatus,
        status_color: statusColor,
        score_breakdown: {
          completeness_factors: completenessFactors,
          completeness_total: completenessScore,
          engagement_breakdown: {
            ...engagementBreakdown,
            unique_sessions: uniqueSessions,
            completed_sessions: completedSessions,
            total_messages: totalMessages,
            completion_rate: completionRate,
            avg_messages_per_session: uniqueSessions > 0 ? totalMessages / uniqueSessions : 0
          },
          engagement_total: Math.round(engagementScore),
          formula: {
            completeness_weight: 0.6,
            engagement_weight: 0.4,
            calculation: `(${completenessScore} × 0.6) + (${Math.round(engagementScore)} × 0.4) = ${overallHealthScore}`
          }
        },
        data_completeness: {
          has_name: !!restaurant.name,
          has_description: !!restaurant.description,
          has_phone: !!restaurant.phone,
          has_email: !!restaurant.email,
          has_address: !!(restaurant.address_street && restaurant.address_city),
          has_hours: !!restaurant.hours,
          has_cuisine: !!restaurant.cuisine,
          has_price_range: !!restaurant.price_range,
          has_website_url: !!restaurant.website_url,
          menu_items_count: menuCounts.total,
          available_menu_items: menuCounts.available,
          has_owner_email: !!restaurant.owner_email
        },
        engagement_metrics: {
          total_messages: totalMessages,
          unique_sessions: uniqueSessions,
          completed_sessions: completedSessions,
          completion_rate: uniqueSessions > 0 ? Math.round((completedSessions / uniqueSessions) * 100) : 0,
          avg_messages_per_session: uniqueSessions > 0 ? Math.round((totalMessages / uniqueSessions) * 10) / 10 : 0,
          days_since_last_activity: daysSinceLastActivity,
          last_activity: convStats.lastActivity?.toISOString() || null
        },
        recommendations,
        days_since_creation: daysSinceCreation,
        created_at: restaurant.created_at
      }
    }).filter((r: any) => r !== null) || []

    // Sort by health score (lowest first - most critical first)
    restaurantHealth.sort((a, b) => (a?.overall_health_score ?? 0) - (b?.overall_health_score ?? 0))

    // Calculate summary statistics (filter ensures non-null)
    const validHealth = restaurantHealth.filter((r): r is NonNullable<typeof r> => r != null)
    const totalRestaurants = validHealth.length
    const healthyCount = validHealth.filter(r => r.health_status === 'healthy').length
    const needsAttentionCount = validHealth.filter(r => r.health_status === 'needs_attention').length
    const criticalCount = validHealth.filter(r => r.health_status === 'critical').length
    const avgHealthScore = totalRestaurants > 0
      ? Math.round(validHealth.reduce((sum, r) => sum + r.overall_health_score, 0) / totalRestaurants)
      : 0
    const avgCompletenessScore = totalRestaurants > 0
      ? Math.round(validHealth.reduce((sum, r) => sum + r.completeness_score, 0) / totalRestaurants)
      : 0
    const avgEngagementScore = totalRestaurants > 0
      ? Math.round(validHealth.reduce((sum, r) => sum + r.engagement_score, 0) / totalRestaurants)
      : 0

    return NextResponse.json({
      restaurantHealth: validHealth,
      summary: {
        total_restaurants: totalRestaurants,
        healthy_count: healthyCount,
        needs_attention_count: needsAttentionCount,
        critical_count: criticalCount,
        avg_health_score: avgHealthScore,
        avg_completeness_score: avgCompletenessScore,
        avg_engagement_score: avgEngagementScore
      },
      timeRangeDays: days
    })

  } catch (error: any) {
    console.error('Error fetching restaurant health:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

