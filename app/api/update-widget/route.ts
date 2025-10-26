import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { widgetId, updateData } = await request.json()
    
    if (!widgetId) {
      return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 })
    }

    // Validate update data
    const allowedFields = [
      'name', 'description', 'phone', 'email', 'address_street', 'address_city', 
      'address_state', 'address_zip', 'address_country', 'hours', 'cuisine', 
      'price_range', 'upselling_style', 'dietary_restrictions', 'special_services',
      'payment_methods', 'dress_code', 'brand_colors', 'is_active'
    ]
    
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as any)

    // Update restaurant data
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .update(filteredData)
      .eq('widget_id', widgetId)
      .select()
      .single()

    if (restaurantError) {
      console.error('Restaurant update error:', restaurantError)
      return NextResponse.json({ error: restaurantError }, { status: 400 })
    }

    // If menu items are being updated
    if (updateData.menu_items) {
      // Delete existing menu items
      await supabaseAdmin
        .from('menu_items')
        .delete()
        .eq('restaurant_id', restaurant.id)

      // Insert new menu items
      if (updateData.menu_items.length > 0) {
        const menuItemsToInsert = updateData.menu_items.map((item: any) => ({
          restaurant_id: restaurant.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          dietary_tags: item.dietaryTags || []
        }))

        const { error: menuError } = await supabaseAdmin
          .from('menu_items')
          .insert(menuItemsToInsert)

        if (menuError) {
          console.error('Menu items update error:', menuError)
          return NextResponse.json({ error: menuError }, { status: 400 })
        }
      }
    }

    // If profitable dishes are being updated
    if (updateData.profitable_dishes) {
      await supabaseAdmin
        .from('restaurants')
        .update({ profitable_dishes: updateData.profitable_dishes })
        .eq('widget_id', widgetId)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Widget updated successfully',
      restaurantId: restaurant.id 
    })

  } catch (error) {
    console.error('Update widget error:', error)
    return NextResponse.json({ 
      error: 'Failed to update widget' 
    }, { status: 500 })
  }
}
