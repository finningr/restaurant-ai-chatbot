import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetId: string } }
) {
  try {
    const { widgetId } = params

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching data for widget:', widgetId)

    // Fetch restaurant data from database
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('widget_id', widgetId)
      .single()

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError)
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Fetch menu items for this restaurant
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('available', true)

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      )
    }

    // Get profitable dish IDs from restaurant data
    const profitableDishIds = restaurant.profitable_dishes?.dish_ids || []
    const profitableDishNames = restaurant.profitable_dishes?.dish_names || []
    
    console.log('Profitable dishes data:', {
      profitable_dishes: restaurant.profitable_dishes,
      dish_ids: profitableDishIds,
      dish_names: profitableDishNames
    })

    // Fetch chatbot settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('chatbot_settings')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .single()

    // Prepare response data
    const responseData = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        phone: restaurant.phone,
        email: restaurant.email,
        address_street: restaurant.address_street,
        address_city: restaurant.address_city,
        address_state: restaurant.address_state,
        address_zip: restaurant.address_zip,
        address_country: restaurant.address_country,
        hours: restaurant.hours,
        cuisine: restaurant.cuisine,
        price_range: restaurant.price_range,
        website_url: restaurant.website_url,
        widget_id: restaurant.widget_id
      },
      menuItems: menuItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        dietary_tags: item.dietary_tags || [],
        available: item.available,
        profitable: profitableDishIds.includes(item.id) || profitableDishNames.includes(item.name)
      })),
      settings: settings ? {
        brand_colors: settings.brand_colors || {
          primary: '#8B4513',
          secondary: '#A0522D',
          accent: '#CD853F'
        },
        system_prompt: settings.system_prompt || `You are a helpful assistant for ${restaurant.name} restaurant.`,
        behavior_rules: settings.behavior_rules || 'Be friendly and helpful.'
      } : {
        brand_colors: {
          primary: '#8B4513',
          secondary: '#A0522D',
          accent: '#CD853F'
        },
        system_prompt: `You are a helpful assistant for ${restaurant.name} restaurant.`,
        behavior_rules: 'Be friendly and helpful.'
      }
    }

    console.log(`Successfully fetched data for ${restaurant.name}: ${menuItems.length} menu items`)
    
    // Set CORS headers for iframe embedding
    const response = NextResponse.json(responseData, { status: 200 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set('Content-Security-Policy', "frame-ancestors *")

    return response

  } catch (error) {
    console.error('Widget API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}