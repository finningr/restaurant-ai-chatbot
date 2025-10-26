import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const restaurantData = await request.json()
    
    // Process profitable dishes data first
    let profitableDishesData = null
    if (restaurantData.menuItems && restaurantData.menuItems.length > 0) {
      const profitableItems = restaurantData.menuItems.filter((item: any) => item.isProfitable)
      if (profitableItems.length > 0) {
        profitableDishesData = {
          dish_ids: [], // Will be populated after menu items are inserted
          dish_names: profitableItems.map((item: any) => item.name)
        }
      }
    }
    
    // Insert restaurant data
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        name: restaurantData.restaurantName,
        description: restaurantData.description,
        phone: restaurantData.phone,
        email: restaurantData.email,
        // Structured address fields
        address_street: restaurantData.address?.street || null,
        address_city: restaurantData.address?.city || null,
        address_state: restaurantData.address?.state || null,
        address_zip: restaurantData.address?.zip || null,
        address_country: restaurantData.address?.country || 'USA',
        // Structured hours as JSONB
        hours: restaurantData.hours,
        cuisine: restaurantData.cuisine,
        price_range: restaurantData.priceRange,
        website_url: restaurantData.websiteUrl,
        widget_id: restaurantData.widgetId || `restaurant-${Date.now()}`,
        raw_menu_text: restaurantData.rawMenuText,
        profitable_dishes: profitableDishesData
      })
      .select()
      .single()

    if (restaurantError) {
      console.error('Restaurant insert error:', restaurantError)
      return NextResponse.json({ error: restaurantError }, { status: 400 })
    }

    // Insert menu items if provided
    if (restaurantData.menuItems && restaurantData.menuItems.length > 0) {
      const menuItemsToInsert = restaurantData.menuItems.map((item: any) => ({
        restaurant_id: restaurant.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        dietary_tags: item.dietaryTags || []
      }))

      const { data: insertedMenuItems, error: menuError } = await supabaseAdmin
        .from('menu_items')
        .insert(menuItemsToInsert)
        .select()

      if (menuError) {
        console.error('Menu items insert error:', menuError)
        // Don't fail the whole request if menu items fail
      } else if (insertedMenuItems && profitableDishesData) {
        // Update profitable dishes with actual IDs
        const profitableItems = restaurantData.menuItems.filter((item: any) => item.isProfitable)
        const profitableDishIds = insertedMenuItems
          .filter((dbItem: any) => 
            profitableItems.some((profitableItem: any) => 
              profitableItem.name === dbItem.name
            )
          )
          .map((item: any) => item.id)
        
        profitableDishesData.dish_ids = profitableDishIds
        
        // Update restaurant with final profitable dishes data
        await supabaseAdmin
          .from('restaurants')
          .update({ profitable_dishes: profitableDishesData })
          .eq('id', restaurant.id)
      }
    }

    // Insert chatbot settings
    const { error: settingsError } = await supabaseAdmin
      .from('chatbot_settings')
      .insert({
        restaurant_id: restaurant.id,
        system_prompt: 'You are a helpful restaurant assistant.',
        behavior_rules: {
          tone: 'friendly',
          style: 'conversational'
        },
        brand_colors: restaurantData.colors
      })

    if (settingsError) {
      console.error('Chatbot settings insert error:', settingsError)
      // Don't fail the whole request if settings fail
    }

    return NextResponse.json({ 
      success: true, 
      restaurantId: restaurant.id,
      widgetId: restaurant.widget_id 
    })

  } catch (error) {
    console.error('Save restaurant error:', error)
    return NextResponse.json({ 
      error: 'Failed to save restaurant data' 
    }, { status: 500 })
  }
}
