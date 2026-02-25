import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const widgetIdParam = searchParams.get('widget_id')
    
    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    let widgetId: string
    let restaurantId: string
    let restaurant: any

    // If widget_id is provided (for admin views), use it directly
    if (widgetIdParam) {
      const { data: restaurantData, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, widget_id, name')
        .eq('widget_id', widgetIdParam)
        .single()

      if (restaurantError || !restaurantData) {
        return NextResponse.json({ 
          error: 'Restaurant not found',
          data: null 
        }, { status: 404 })
      }

      widgetId = restaurantData.widget_id
      restaurantId = restaurantData.id
      restaurant = restaurantData
    } else {
      // Otherwise, use the authenticated user's email
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const userEmail = session.user.email

      // Get restaurant for this user
      const { data: restaurantData, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, widget_id, name')
        .eq('owner_email', userEmail)
        .single()

      if (restaurantError || !restaurantData) {
        return NextResponse.json({ 
          error: 'Restaurant not found',
          data: null 
        }, { status: 404 })
      }

      widgetId = restaurantData.widget_id
      restaurantId = restaurantData.id
      restaurant = restaurantData
    }

    // Total Conversations (unique sessions)
    const { count: totalConversations } = await supabaseAdmin
      .from('chat_messages')
      .select('session_id', { count: 'exact', head: true })
      .eq('widget_id', widgetId)
      .not('session_id', 'is', null)

    // Get unique session count
    const { data: sessions } = await supabaseAdmin
      .from('chat_messages')
      .select('session_id')
      .eq('widget_id', widgetId)
      .not('session_id', 'is', null)

    const uniqueSessions = new Set(sessions?.map(s => s.session_id) || [])
    const totalConversationsCount = uniqueSessions.size

    // Messages This Week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const { count: messagesThisWeek } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('widget_id', widgetId)
      .gte('created_at', weekAgo.toISOString())

    // Most Popular Menu Items - Separate by User vs Chatbot
    const { data: allMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('menu_items_mentioned, role')
      .eq('widget_id', widgetId)
      .not('menu_items_mentioned', 'is', null)

    const userMenuItemCounts: Record<string, number> = {}
    const chatbotMenuItemCounts: Record<string, number> = {}
    
    allMessages?.forEach(msg => {
      if (msg.menu_items_mentioned && Array.isArray(msg.menu_items_mentioned)) {
        const counts = msg.role === 'user' ? userMenuItemCounts : chatbotMenuItemCounts
        msg.menu_items_mentioned.forEach((item: string) => {
          counts[item] = (counts[item] || 0) + 1
        })
      }
    })

    // Combine and get top items
    const allMenuItems = new Set([
      ...Object.keys(userMenuItemCounts),
      ...Object.keys(chatbotMenuItemCounts)
    ])

    const mostPopularMenuItems = Array.from(allMenuItems)
      .map(name => ({
        name,
        userMentions: userMenuItemCounts[name] || 0,
        chatbotMentions: chatbotMenuItemCounts[name] || 0,
        totalMentions: (userMenuItemCounts[name] || 0) + (chatbotMenuItemCounts[name] || 0)
      }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 5)

    // Daily Conversations and Messages (last 30 days) for line chart
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('created_at, session_id')
      .eq('widget_id', widgetId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Group by date for conversations and messages
    const dailyConversations: Record<string, Set<string>> = {}
    const dailyMessages: Record<string, number> = {}
    
    recentMessages?.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0]
      
      // Count conversations (unique sessions)
      if (!dailyConversations[date]) {
        dailyConversations[date] = new Set()
      }
      if (msg.session_id) {
        dailyConversations[date].add(msg.session_id)
      }
      
      // Count messages
      dailyMessages[date] = (dailyMessages[date] || 0) + 1
    })

    const dailyActivityArray = Object.keys(dailyConversations)
      .map(date => ({
        date,
        conversations: dailyConversations[date].size,
        messages: dailyMessages[date] || 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Peak Hours (hour of day)
    const { data: allMessagesForHours } = await supabaseAdmin
      .from('chat_messages')
      .select('created_at')
      .eq('widget_id', widgetId)

    const hourCounts: Record<number, number> = {}
    allMessagesForHours?.forEach(msg => {
      const hour = new Date(msg.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      messages: hourCounts[hour] || 0
    }))

    // Total Messages (all time)
    const { count: totalMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('widget_id', widgetId)

    // Engagement Depth - Average messages per conversation
    const avgMessagesPerConversation = totalConversationsCount > 0
      ? (totalMessages || 0) / totalConversationsCount
      : 0

    // Estimated Revenue Impact - Based on homepage calculator formula
    // Formula from homepage: visits × conversion_rate × party_size × revenue_per_customer
    // Adapted for conversations: conversations × conversion_rate × party_size × revenue_per_customer
    const conversionRate = 0.13 // 13% conversion rate (with chatbot)
    const partySize = 2.5 // Average party size
    const revenuePerCustomer = 18 // $18 per customer
    const estimatedRevenueImpact = Math.round(totalConversationsCount * conversionRate * partySize * revenuePerCustomer)

    // Common Questions - Extract from user messages
    const { data: userMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('message')
      .eq('widget_id', widgetId)
      .eq('role', 'user')
      .limit(100) // Get recent user messages

    // Count question occurrences
    const questionCounts: Record<string, number> = {}
    userMessages?.forEach(msg => {
      const normalizedMessage = msg.message.toLowerCase().trim()
      questionCounts[normalizedMessage] = (questionCounts[normalizedMessage] || 0) + 1
    })

    const commonQuestions = Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([question, count]) => ({ question, count }))

    return NextResponse.json({
      restaurant: {
        id: restaurantId,
        widget_id: widgetId,
        name: restaurant.name
      },
      analytics: {
        totalConversations: totalConversationsCount,
        totalMessages: totalMessages || 0,
        messagesThisWeek: messagesThisWeek || 0,
        mostPopularMenuItems: mostPopularMenuItems, // Already formatted as array with userMentions and chatbotMentions
        dailyActivity: dailyActivityArray,
        peakHours,
        estimatedRevenueImpact,
        avgMessagesPerConversation: parseFloat(avgMessagesPerConversation.toFixed(2)),
        commonQuestions
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

