import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getPreviewData } from '@/lib/preview-cache'

// Force dynamic rendering - this route must always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Transform manual-input / preview storage format to widget API format */
function transformPreviewToWidgetFormat(raw: any) {
  const addr = raw.address
  let address_street = ''
  let address_city = ''
  let address_state = ''
  let address_zip = ''
  let address_country = 'USA'
  if (typeof addr === 'object' && addr) {
    address_street = addr.street || addr.address_street || ''
    address_city = addr.city || addr.address_city || ''
    address_state = addr.state || addr.address_state || ''
    address_zip = addr.zip || addr.address_zip || ''
    address_country = addr.country || addr.address_country || 'USA'
  } else if (typeof addr === 'string') {
    address_street = addr
  }

  // Hours: manual input may have hoursMain, hours (object with main), or hours (string)
  let hours: any = { main: {} }
  if (raw.hoursMain && typeof raw.hoursMain === 'object') {
    hours = { main: raw.hoursMain }
  } else if (raw.hours && typeof raw.hours === 'object') {
    if (raw.hours.main) {
      hours = raw.hours
    } else {
      // Flat object with monday, tuesday, etc.
      hours = { main: raw.hours }
    }
  } else if (raw.hours && typeof raw.hours === 'string') {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days.forEach(d => { hours.main[d] = raw.hours })
  }

  const colors = raw.colors || {}
  const brandColors = {
    primary: colors.primary || '#0284c7',
    secondary: colors.secondary || '#0ea5e9',
    accent: colors.accent || '#38bdf8'
  }

  const parsedMenuItems = raw.parsedMenuItems || []
  const menuItems = parsedMenuItems.map((item: any, i: number) => ({
    id: item.id || String(i + 1),
    name: item.name || 'Item',
    category: item.category || 'Other',
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
    dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
    available: item.available !== false,
    profitable: false,
    menu_type: item.menu_type || null
  }))

  const deliveryLinks = raw.deliveryLinks || {}
  const specialServices = Array.isArray(raw.specialServices)
    ? raw.specialServices
    : typeof raw.specialServices === 'string'
      ? raw.specialServices.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

  return {
    restaurant: {
      id: 'preview',
      name: raw.name || 'Restaurant',
      description: raw.description || '',
      phone: raw.phone || '',
      email: raw.email || '',
      address_street,
      address_city,
      address_state,
      address_zip,
      address_country,
      hours,
      cuisine: raw.cuisine || raw.cuisineOther || '',
      price_range: raw.priceRange || '$$',
      website_url: raw.websiteUrl || raw.url || '',
      widget_id: 'preview',
      delivery_links: deliveryLinks,
      reservation_link: raw.reservationLink || null,
      catering_link: raw.cateringLink || null,
      special_services: specialServices
    },
    menuItems,
    settings: {
      brand_colors: brandColors,
      system_prompt: `You are a helpful assistant for ${raw.name || 'this restaurant'}.`,
      behavior_rules: 'Be friendly and helpful.'
    }
  }
}

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

    // Preview widget: return data from preview cache (manual-input flow)
    if (widgetId === 'preview') {
      const token = searchParams.get('token')
      if (!token) {
        return NextResponse.json(
          { error: 'Preview token is required' },
          { status: 400 }
        )
      }
      const raw = getPreviewData(token)
      if (!raw) {
        return NextResponse.json(
          { error: 'Preview expired or not found' },
          { status: 404 }
        )
      }
      const previewData = transformPreviewToWidgetFormat(raw)
      const response = NextResponse.json(previewData, { status: 200 })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Demo widget: return hardcoded Mediterranean restaurant (no DB)
    if (widgetId === 'demo') {
      const demoData = {
        restaurant: {
          id: 'demo-azura',
          name: 'Azura Mediterranean',
          description: 'Authentic Mediterranean cuisine in the heart of Denver. Fresh ingredients, traditional recipes, and warm hospitality.',
          phone: '(555) 123-4567',
          email: 'info@azurarestaurant.com',
          address_street: '123 Mediterranean Way',
          address_city: 'Denver',
          address_state: 'CO',
          address_zip: '80202',
          address_country: 'USA',
          hours: {
            main: {
              monday: '11:00 AM - 10:00 PM',
              tuesday: '11:00 AM - 10:00 PM',
              wednesday: '11:00 AM - 10:00 PM',
              thursday: '11:00 AM - 10:00 PM',
              friday: '11:00 AM - 11:00 PM',
              saturday: '11:00 AM - 11:00 PM',
              sunday: '12:00 PM - 9:00 PM'
            }
          },
          cuisine: 'Mediterranean',
          price_range: '$$',
          website_url: 'https://example.com',
          widget_id: 'demo',
          delivery_links: {
            uber_eats: 'https://example.com/sample-uber-eats',
            doordash: 'https://example.com/sample-doordash',
            website_order: 'https://example.com/sample-order'
          },
          reservation_link: 'https://example.com/sample-reservation',
          catering_link: 'https://example.com/sample-catering',
          special_services: ['Dine-in', 'Takeout', 'Reservations']
        },
        menuItems: [
          { id: '1', name: 'Hummus Trio', category: 'Appetizers', description: 'Classic, roasted red pepper, and garlic hummus with warm pita', price: 12, dietary_tags: ['vegetarian', 'vegan'], available: true, profitable: false, menu_type: null },
          { id: '2', name: 'Falafel Platter', category: 'Appetizers', description: 'Crispy falafel with tahini sauce and fresh vegetables', price: 14, dietary_tags: ['vegetarian', 'vegan'], available: true, profitable: false, menu_type: null },
          { id: '3', name: 'Lamb Kebab', category: 'Main Courses', description: 'Grilled lamb with rice pilaf and grilled vegetables', price: 24, dietary_tags: [], available: true, profitable: true, menu_type: null },
          { id: '4', name: 'Chicken Shawarma', category: 'Main Courses', description: 'Marinated chicken with garlic sauce and fresh vegetables', price: 18, dietary_tags: [], available: true, profitable: false, menu_type: null },
          { id: '5', name: 'Mediterranean Seafood Platter', category: 'Main Courses', description: 'Grilled fish, shrimp, and calamari with lemon herb sauce', price: 28, dietary_tags: [], available: true, profitable: false, menu_type: null },
          { id: '6', name: 'Vegetarian Moussaka', category: 'Main Courses', description: 'Layered eggplant with tomato sauce and béchamel', price: 16, dietary_tags: ['vegetarian'], available: true, profitable: false, menu_type: null },
          { id: '7', name: 'Grilled Salmon', category: 'Main Courses', description: 'Mediterranean herbs with quinoa and seasonal vegetables', price: 26, dietary_tags: ['gluten-free'], available: true, profitable: false, menu_type: null },
          { id: '8', name: 'Greek Salad', category: 'Salads & Sides', description: 'Fresh tomatoes, cucumbers, olives, and feta cheese', price: 12, dietary_tags: ['vegetarian', 'gluten-free'], available: true, profitable: false, menu_type: null },
          { id: '9', name: 'Mediterranean Quinoa Bowl', category: 'Salads & Sides', description: 'Quinoa with roasted vegetables and tahini dressing', price: 14, dietary_tags: ['vegetarian', 'vegan'], available: true, profitable: false, menu_type: null }
        ],
        settings: {
          brand_colors: { primary: '#0284c7', secondary: '#0ea5e9', accent: '#38bdf8' },
          system_prompt: 'You are a helpful assistant for Azura Mediterranean.',
          behavior_rules: 'Be friendly and helpful.'
        }
      }
      const response = NextResponse.json(demoData, { status: 200 })
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

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