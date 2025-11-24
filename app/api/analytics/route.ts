import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Supabase environment variables not available, returning mock data')
      return NextResponse.json({
        totalRestaurants: 0,
        activeWidgets: 0,
        totalMessages: 0,
        popularCuisines: [],
        widgetPerformance: [],
        recentActivity: []
      })
    }

    // Dynamically import supabaseAdmin to avoid build-time errors
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      // Return mock data if Supabase is not configured
      return NextResponse.json({
        totalRestaurants: 0,
        activeWidgets: 0,
        totalMessages: 0,
        popularCuisines: [],
        widgetPerformance: [],
        recentActivity: []
      })
    }
    
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
    }

    // Get total restaurants
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, widget_id, cuisine, is_active, created_at')

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      // Return empty data instead of error to prevent build failures
      return NextResponse.json({
        totalRestaurants: 0,
        activeWidgets: 0,
        totalMessages: 0,
        popularCuisines: [],
        widgetPerformance: [],
        recentActivity: []
      })
    }

    // Get active widgets count
    const activeWidgets = restaurants?.filter(r => r.is_active).length || 0

    // Get popular cuisines
    const cuisineCounts = restaurants?.reduce((acc, restaurant) => {
      const cuisine = restaurant.cuisine || 'Unknown'
      acc[cuisine] = (acc[cuisine] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const popularCuisines = Object.entries(cuisineCounts || {})
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get widget performance (mock data for now - would need chat logs table)
    const widgetPerformance = restaurants?.map(restaurant => ({
      widget_id: restaurant.widget_id,
      name: restaurant.name,
      messages: Math.floor(Math.random() * 100), // Mock data
      active: restaurant.is_active
    })).sort((a, b) => b.messages - a.messages) || []

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        type: 'restaurant_created',
        description: 'New restaurant "Sample Restaurant" was created',
        timestamp: new Date().toISOString()
      },
      {
        type: 'widget_activated',
        description: 'Widget "restaurant-123" was activated',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        type: 'menu_updated',
        description: 'Menu items updated for "Sample Restaurant"',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]

    const analyticsData = {
      totalRestaurants: restaurants?.length || 0,
      activeWidgets,
      totalMessages: widgetPerformance.reduce((sum, widget) => sum + widget.messages, 0),
      popularCuisines,
      widgetPerformance,
      recentActivity
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
