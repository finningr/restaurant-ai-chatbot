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

    // Fetch conversation logs
    let conversationsQuery = supabaseAdmin
      .from('conversation_logs')
      .select('timestamp, user_message, ip_address, user_agent, restaurant_id')
      .order('timestamp', { ascending: false })

    if (startDate) {
      conversationsQuery = conversationsQuery.gte('timestamp', startDate.toISOString())
    }

    const { data: conversations, error: conversationsError } = await conversationsQuery.limit(10000)

    if (conversationsError) {
      console.error('Error fetching conversations for usage patterns:', conversationsError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Fetch restaurants for mapping
    const restaurantIds = Array.from(new Set(conversations?.map((c: any) => c.restaurant_id).filter(Boolean) || []))
    const { data: restaurants } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, widget_id')
      .in('id', restaurantIds)

    const restaurantMap = new Map(restaurants?.map((r: any) => [r.id, r]) || [])

    // 1. Hourly Patterns (0-23)
    const hourlyPatterns: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyPatterns[i] = 0
    }

    // 2. Daily Patterns (0-6, Sunday-Saturday)
    const dailyPatterns: Record<number, number> = {}
    for (let i = 0; i < 7; i++) {
      dailyPatterns[i] = 0
    }

    // 3. Most Common Questions/Topics
    const questionCounts: Record<string, number> = {}
    const questionExamples: Record<string, string[]> = {} // Store example questions

    // 4. Usage Trends (messages per day)
    const dailyTrends: Record<string, number> = {}

    // 5. Geographic Patterns (from IP if available)
    const geographicPatterns: Record<string, number> = {}

    // 6. Device/Browser Breakdown
    const deviceBreakdown: Record<string, number> = {}
    const browserBreakdown: Record<string, number> = {}

    conversations?.forEach((conv: any) => {
      const timestamp = new Date(conv.timestamp)

      // Hourly pattern
      const hour = timestamp.getHours()
      hourlyPatterns[hour] = (hourlyPatterns[hour] || 0) + 1

      // Daily pattern (0 = Sunday, 6 = Saturday)
      const dayOfWeek = timestamp.getDay()
      dailyPatterns[dayOfWeek] = (dailyPatterns[dayOfWeek] || 0) + 1

      // Daily trends (YYYY-MM-DD format)
      const dateKey = timestamp.toISOString().split('T')[0]
      dailyTrends[dateKey] = (dailyTrends[dateKey] || 0) + 1

      // Common questions (normalize and count)
      if (conv.user_message) {
        const normalizedMessage = conv.user_message.toLowerCase().trim()
        // Skip very short messages (likely greetings)
        if (normalizedMessage.length > 5) {
          // Extract key words/phrases (simple approach - first few words)
          const words = normalizedMessage.split(/\s+/).slice(0, 5).join(' ')
          questionCounts[words] = (questionCounts[words] || 0) + 1
          
          // Store example (first occurrence)
          if (!questionExamples[words] || questionExamples[words].length < 3) {
            if (!questionExamples[words]) {
              questionExamples[words] = []
            }
            if (!questionExamples[words].includes(conv.user_message)) {
              questionExamples[words].push(conv.user_message)
            }
          }
        }
      }

      // Geographic patterns (simple IP-based, could be enhanced with geolocation API)
      if (conv.ip_address) {
        // For now, just count by IP (could be enhanced with geolocation)
        geographicPatterns[conv.ip_address] = (geographicPatterns[conv.ip_address] || 0) + 1
      }

      // Device/Browser breakdown
      if (conv.user_agent) {
        const ua = conv.user_agent.toLowerCase()
        
        // Device type
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
          deviceBreakdown['Mobile'] = (deviceBreakdown['Mobile'] || 0) + 1
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          deviceBreakdown['Tablet'] = (deviceBreakdown['Tablet'] || 0) + 1
        } else {
          deviceBreakdown['Desktop'] = (deviceBreakdown['Desktop'] || 0) + 1
        }

        // Browser type
        if (ua.includes('chrome') && !ua.includes('edg')) {
          browserBreakdown['Chrome'] = (browserBreakdown['Chrome'] || 0) + 1
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
          browserBreakdown['Safari'] = (browserBreakdown['Safari'] || 0) + 1
        } else if (ua.includes('firefox')) {
          browserBreakdown['Firefox'] = (browserBreakdown['Firefox'] || 0) + 1
        } else if (ua.includes('edg')) {
          browserBreakdown['Edge'] = (browserBreakdown['Edge'] || 0) + 1
        } else {
          browserBreakdown['Other'] = (browserBreakdown['Other'] || 0) + 1
        }
      }
    })

    // Find peak hours
    const peakHour = Object.entries(hourlyPatterns).reduce((a, b) => 
      hourlyPatterns[parseInt(a[0])] > hourlyPatterns[parseInt(b[0])] ? a : b
    )[0]

    // Find peak day
    const peakDay = Object.entries(dailyPatterns).reduce((a, b) => 
      dailyPatterns[parseInt(a[0])] > dailyPatterns[parseInt(b[0])] ? a : b
    )[0]

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Top questions (sorted by frequency)
    const topQuestions = Object.entries(questionCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 20)
      .map(([pattern, count]) => ({
        pattern,
        count: count as number,
        examples: questionExamples[pattern] || []
      }))

    // Daily trends (sorted by date)
    const sortedDailyTrends = Object.entries(dailyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        count: count as number,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    // Top geographic locations (by unique IP count)
    const topLocations = Object.entries(geographicPatterns)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([ip, count]) => ({
        ip,
        count: count as number
      }))

    // Calculate summary stats
    const totalMessages = conversations?.length || 0
    const uniqueIPs = Object.keys(geographicPatterns).length
    const avgMessagesPerDay = sortedDailyTrends.length > 0
      ? Math.round(sortedDailyTrends.reduce((sum, day) => sum + day.count, 0) / sortedDailyTrends.length)
      : 0

    return NextResponse.json({
      usagePatterns: {
        hourlyPatterns: Object.entries(hourlyPatterns).map(([hour, count]) => ({
          hour: parseInt(hour),
          hourLabel: `${hour}:00`,
          count: count as number
        })),
        dailyPatterns: Object.entries(dailyPatterns).map(([day, count]) => ({
          day: parseInt(day),
          dayName: dayNames[parseInt(day)],
          count: count as number
        })),
        peakHour: parseInt(peakHour),
        peakDay: parseInt(peakDay),
        peakDayName: dayNames[parseInt(peakDay)],
        topQuestions,
        dailyTrends: sortedDailyTrends,
        deviceBreakdown: Object.entries(deviceBreakdown).map(([device, count]) => ({
          device,
          count: count as number
        })),
        browserBreakdown: Object.entries(browserBreakdown).map(([browser, count]) => ({
          browser,
          count: count as number
        })),
        topLocations
      },
      summary: {
        totalMessages,
        uniqueIPs,
        avgMessagesPerDay,
        peakHour: parseInt(peakHour),
        peakDayName: dayNames[parseInt(peakDay)]
      },
      timeRangeDays: days
    })

  } catch (error: any) {
    console.error('Error fetching usage patterns:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}


