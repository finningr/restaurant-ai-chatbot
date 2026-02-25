import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { logActivity, getClientIP, getUserAgent } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { widgetId, updateData } = await request.json()
    
    if (!widgetId) {
      return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 })
    }

    // Validate update data
    const allowedFields = [
      'name', 'description', 'phone', 'email', 'owner_email', 'address_street', 'address_city', 
      'address_state', 'address_zip', 'address_country', 'hours', 'cuisine', 
      'price_range', 'upselling_style', 'dietary_restrictions', 'special_services',
      'payment_methods', 'dress_code', 'brand_colors', 'is_active', 'website_url',
      'delivery_links', 'reservation_link', 'catering_link'
    ]
    
    // Handle camelCase to snake_case conversions
    const restaurantUpdateData: any = {}
    if (updateData.ownerEmail !== undefined) {
      restaurantUpdateData.owner_email = updateData.ownerEmail
    }
    if (updateData.websiteUrl !== undefined) {
      restaurantUpdateData.website_url = updateData.websiteUrl
    }
    if (updateData.deliveryLinks !== undefined) {
      restaurantUpdateData.delivery_links = updateData.deliveryLinks
    }
    if (updateData.reservationLink !== undefined) {
      restaurantUpdateData.reservation_link = updateData.reservationLink
    }
    if (updateData.cateringLink !== undefined) {
      restaurantUpdateData.catering_link = updateData.cateringLink
    }
    
    const filteredData = Object.keys(updateData)
      .filter(key => {
        if (key === 'ownerEmail' || key === 'websiteUrl' || key === 'deliveryLinks' || key === 'reservationLink' || key === 'cateringLink') return false // Handled separately
        return allowedFields.includes(key)
      })
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as any)

    // Merge converted fields into update data
    const finalUpdateData = { ...filteredData, ...restaurantUpdateData }

    // Update restaurant data
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .update(finalUpdateData)
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
          dietary_tags: item.dietaryTags || [],
          menu_type: item.menuType || null
        }))

        const { data: insertedMenuItems, error: menuError } = await supabaseAdmin
          .from('menu_items')
          .insert(menuItemsToInsert)
          .select()

        if (menuError) {
          console.error('Menu items update error:', menuError)
          return NextResponse.json({ error: menuError }, { status: 400 })
        }

        // Update profitable dishes with actual IDs if provided
        if (updateData.profitable_dishes && insertedMenuItems) {
          const profitableDishNames = updateData.profitable_dishes.dish_names || []
          const profitableDishIds = insertedMenuItems
            .filter((item: any) => profitableDishNames.includes(item.name))
            .map((item: any) => item.id)

          await supabaseAdmin
            .from('restaurants')
            .update({ 
              profitable_dishes: {
                dish_ids: profitableDishIds,
                dish_names: profitableDishNames
              }
            })
            .eq('widget_id', widgetId)
        }
      } else {
        // If no menu items, clear profitable dishes
        await supabaseAdmin
          .from('restaurants')
          .update({ profitable_dishes: null })
          .eq('widget_id', widgetId)
      }
    } else if (updateData.profitable_dishes) {
      // If only profitable dishes are being updated (without menu items)
      await supabaseAdmin
        .from('restaurants')
        .update({ profitable_dishes: updateData.profitable_dishes })
        .eq('widget_id', widgetId)
    }

    // Update brand colors in chatbot_settings if provided
    if (updateData.brandColors) {
      const { error: settingsError } = await supabaseAdmin
        .from('chatbot_settings')
        .upsert({
          restaurant_id: restaurant.id,
          brand_colors: updateData.brandColors,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'restaurant_id'
        })

      if (settingsError) {
        console.error('Error updating brand colors:', settingsError)
        // Don't fail the whole request if brand colors fail
      }
    }

    // Log activity
    if (session?.user?.email) {
      const userRole = (session.user as any)?.role || 'restaurant'
      const actionType = updateData.menu_items ? 'edit_menu' : 'edit_restaurant'
      const changedFields = Object.keys(updateData).filter(key => 
        key !== 'menu_items' && key !== 'profitable_dishes'
      )
      
      await logActivity({
        user_email: session.user.email,
        user_role: userRole,
        action_type: actionType,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        details: {
          changed_fields: changedFields,
          menu_items_updated: !!updateData.menu_items
        },
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request)
      })
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
