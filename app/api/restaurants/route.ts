import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - this route requires Supabase at runtime
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        id,
        name,
        widget_id,
        description,
        phone,
        email,
        cuisine,
        price_range,
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching restaurants:', error)
      return NextResponse.json({ error: error }, { status: 400 })
    }

    return NextResponse.json(restaurants || [])

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
