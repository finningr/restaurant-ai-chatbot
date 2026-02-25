import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email

    // Get restaurant for this user
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('owner_email', userEmail)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ 
        error: 'Restaurant not found',
        data: null 
      }, { status: 404 })
    }

    // Fetch menu items for this restaurant
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('available', true)

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
    }

    // Format restaurant info to match MenuReview component format
    const restaurantInfo = {
      name: restaurant.name || '',
      description: restaurant.description || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      ownerEmail: restaurant.owner_email || '',
      address: restaurant.address_street 
        ? {
            street: restaurant.address_street,
            city: restaurant.address_city,
            state: restaurant.address_state,
            zip: restaurant.address_zip,
            country: restaurant.address_country || 'USA'
          }
        : '',
      hours: restaurant.hours || '',
      cuisine: restaurant.cuisine || '',
      priceRange: restaurant.price_range || '',
      websiteUrl: restaurant.website_url || '',
      deliveryLinks: restaurant.delivery_links || null,
      reservationLink: restaurant.reservation_link || null,
      cateringLink: restaurant.catering_link || null,
      specialServices: restaurant.special_services || [],
    }

    // Format menu items to match MenuReview component format
    const profitableDishIds = restaurant.profitable_dishes?.dish_ids || []
    const profitableDishNames = restaurant.profitable_dishes?.dish_names || []
    
    const formattedMenuItems = (menuItems || []).map((item: any) => ({
      name: item.name,
      price: item.price,
      category: item.category || 'Main Course',
      description: item.description || '',
      dietaryTags: item.dietary_tags || [],
      menuType: item.menu_type || null,
      isProfitable: profitableDishIds.includes(item.id) || profitableDishNames.includes(item.name)
    }))

    // Fetch brand colors from chatbot_settings
    const { data: settings } = await supabaseAdmin
      .from('chatbot_settings')
      .select('brand_colors')
      .eq('restaurant_id', restaurant.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const brandColors = settings?.brand_colors || {
      primary: '#4F46E5',
      secondary: '#6366F1',
      accent: '#818CF8'
    }

    return NextResponse.json({
      restaurant: {
        ...restaurantInfo,
        brandColors
      },
      menuItems: formattedMenuItems,
      widgetId: restaurant.widget_id,
      restaurantId: restaurant.id,
      isActive: restaurant.is_active
    })

  } catch (error) {
    console.error('Error fetching restaurant data:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

