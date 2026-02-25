import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - this route must always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Check if this is a test request (from admin dashboard)
    const { searchParams } = new URL(request.url)
    const isTestMode = searchParams.get('test') === 'true'

    // Fetch restaurant data from database
    // In test mode, allow inactive restaurants (for admin testing)
    // In production, only allow active restaurants
    let query = supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('widget_id', widgetId)
      .is('deleted_at', null)
    
    if (!isTestMode) {
      query = query.eq('is_active', true)
    }
    
    const { data: restaurant, error: restaurantError } = await query.single()

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
    
    // Fetch chatbot settings - FIRST check ALL rows to see if there are duplicates
    const { data: allSettings, error: allSettingsError } = await supabaseAdmin
      .from('chatbot_settings')
      .select('*')
      .eq('restaurant_id', restaurant.id)
    
    // Now fetch with maybeSingle - ORDER BY updated_at DESC to get most recent
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('chatbot_settings')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('updated_at', { ascending: false })
      .maybeSingle() // Use maybeSingle() instead of single() to avoid errors

    // Log for debugging
    if (settingsError) {
      console.error('Error fetching chatbot settings:', settingsError)
    }
    if (!settings) {
      console.warn('No chatbot settings found for restaurant_id:', restaurant.id)
    }

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
        widget_id: restaurant.widget_id,
        delivery_links: restaurant.delivery_links || {},
        reservation_link: restaurant.reservation_link || null,
        catering_link: restaurant.catering_link || null,
        special_services: restaurant.special_services || [],
      },
      menuItems: menuItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        dietary_tags: item.dietary_tags || [],
        available: item.available,
        profitable: profitableDishIds.includes(item.id) || profitableDishNames.includes(item.name),
        menu_type: item.menu_type || null
      })),
      settings: (() => {
        // Default colors
        const defaultColors = {
          primary: '#4F46E5',
          secondary: '#6366F1',
          accent: '#818CF8'
        }
        
        if (!settings) {
          return {
            brand_colors: defaultColors,
            system_prompt: `You are a helpful assistant for ${restaurant.name} restaurant.`,
            behavior_rules: 'Be friendly and helpful.'
          }
        }
        
        // Use database colors directly if they exist
        let brandColors = defaultColors
        
        if (settings.brand_colors) {
          const dbColors = settings.brand_colors as any
          brandColors = {
            primary: dbColors.primary || defaultColors.primary,
            secondary: dbColors.secondary || defaultColors.secondary,
            accent: dbColors.accent || defaultColors.accent
          }
        } else {
          console.warn('No brand_colors in settings, using defaults')
        }
        
        return {
          brand_colors: brandColors,
          system_prompt: settings.system_prompt || `You are a helpful assistant for ${restaurant.name} restaurant.`,
          behavior_rules: settings.behavior_rules || 'Be friendly and helpful.'
        }
      })()
    }

    // Set CORS headers for iframe embedding + prevent caching
    const response = NextResponse.json(responseData, { status: 200 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set('Content-Security-Policy', "frame-ancestors *")
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response

  } catch (error) {
    console.error('Widget API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}