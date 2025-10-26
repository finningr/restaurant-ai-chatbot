import { supabaseAdmin } from '@/lib/supabase'

// GET /api/restaurant/[id] - Get restaurant data by widget_id
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        menu_items(*),
        chatbot_settings(*)
      `)
      .eq('widget_id', id)
      .eq('is_active', true)
      .single()
      
    if (error) {
      console.error('Error fetching restaurant:', error)
      return Response.json({ error: 'Restaurant not found' }, { status: 404 })
    }
    
    return Response.json(restaurant)
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/restaurant/[id] - Update restaurant data
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updates = await request.json()
    
    // Update restaurant data
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('widget_id', id)
      .select()
      .single()
      
    if (restaurantError) {
      console.error('Error updating restaurant:', restaurantError)
      return Response.json({ error: restaurantError.message }, { status: 400 })
    }
    
    // Update chatbot settings if provided
    if (updates.behavior_rules || updates.system_prompt) {
      const { error: settingsError } = await supabaseAdmin
        .from('chatbot_settings')
        .upsert({
          restaurant_id: restaurant.id,
          system_prompt: updates.system_prompt,
          behavior_rules: updates.behavior_rules,
          updated_at: new Date().toISOString()
        })
        
      if (settingsError) {
        console.error('Error updating chatbot settings:', settingsError)
        return Response.json({ error: settingsError.message }, { status: 400 })
      }
    }
    
    return Response.json(restaurant)
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
