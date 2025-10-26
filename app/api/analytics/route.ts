import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: restaurantsError }, { status: 400 })
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
