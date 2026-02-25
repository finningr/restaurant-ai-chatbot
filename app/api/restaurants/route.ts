import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - this route requires Supabase at runtime
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerEmail = searchParams.get('owner_email')
    const salesRepEmail = searchParams.get('sales_rep_email')
    const createdBy = searchParams.get('created_by')
    const onboardedOnly = searchParams.get('onboarded_only') === 'true'
    const showDeleted = searchParams.get('show_deleted') === 'true'
    const widgetId = searchParams.get('widget_id')

    let query = supabaseAdmin
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
        created_at,
        owner_email,
        sales_rep_email,
        is_onboarded,
        deleted_at
      `)

    // Filter out deleted restaurants by default (unless show_deleted=true)
    if (!showDeleted) {
      query = query.is('deleted_at', null)
    }

    // Filter by owner_email if provided
    if (ownerEmail) {
      query = query.eq('owner_email', decodeURIComponent(ownerEmail))
    }
    
    // Filter by sales_rep_email if provided
    if (salesRepEmail) {
      query = query.eq('sales_rep_email', decodeURIComponent(salesRepEmail))
    }

    // Filter by created_by if provided (for sales rep demos)
    // Also include restaurants where sales_rep_email matches (for backward compatibility)
    if (createdBy) {
      const email = decodeURIComponent(createdBy)
      query = query.or(`created_by.eq.${email},sales_rep_email.eq.${email}`)
    }
    
    // Filter to only onboarded restaurants if requested
    if (onboardedOnly) {
      query = query.eq('is_onboarded', true)
    }

    // Filter by widget_id if provided
    if (widgetId) {
      query = query.eq('widget_id', widgetId)
    }

    const { data: restaurants, error } = await query.order('created_at', { ascending: false })

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
