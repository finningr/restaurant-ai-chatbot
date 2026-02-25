import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restaurantId } = await request.json()
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Check if user is sales rep or admin
    const userRole = (session?.user as any)?.role
    if (userRole !== 'sales_rep' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update restaurant to be onboarded and activate it
    const { error } = await supabaseAdmin
      .from('restaurants')
      .update({ 
        is_onboarded: true,
        is_active: true  // Activate when onboarded
      })
      .eq('id', restaurantId)

    if (error) {
      console.error('Error marking restaurant as onboarded:', error)
      return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in mark-onboarded:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




