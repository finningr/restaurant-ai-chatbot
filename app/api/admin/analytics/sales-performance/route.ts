import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get time range from query params (default: 30 days)
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30'
    const isAllTime = timeRange === 'all'
    const days = isAllTime ? 0 : parseInt(timeRange) || 30

    // Calculate date range
    let startDate: Date | null = null
    if (!isAllTime) {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // Get all sales reps from users.json file
    let salesReps: any[] = []
    try {
      const usersFilePath = path.join(process.cwd(), 'users.json')
      if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8')
        const usersArray = JSON.parse(fileContent)
        
        // Convert from Map-like structure to array
        const users = Array.isArray(usersArray) 
          ? usersArray.map(([email, userData]: [string, any]) => ({
              email,
              ...userData
            }))
          : Object.entries(usersArray).map(([email, userData]: [string, any]) => ({
              email,
              ...userData
            }))
        
        salesReps = users.filter((user: any) => 
          user.role === 'sales_rep' && user.status !== 'deleted' && user.status !== 'paused'
        )
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error)
    }

    // Get all restaurants created by sales reps
    let restaurantsQuery = supabaseAdmin
      .from('restaurants')
      .select('id, name, created_by, created_at, is_onboarded, owner_email, is_active, deleted_at')
      .not('created_by', 'is', null)
      .is('deleted_at', null)

    if (!isAllTime && startDate) {
      restaurantsQuery = restaurantsQuery.gte('created_at', startDate.toISOString())
    }

    const { data: restaurants, error: restaurantsError } = await restaurantsQuery

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError)
      return NextResponse.json({ 
        error: 'Failed to fetch restaurants' 
      }, { status: 500 })
    }

    // Aggregate stats by sales rep
    const salesRepStats: Record<string, {
      email: string
      name: string
      totalDemos: number
      onboardedRestaurants: number
      conversionRate: number
      demosLast30Days: number
      onboardedLast30Days: number
      avgTimeToConversion: number | null
      totalRevenue: number // Placeholder for future revenue tracking
    }> = {}

    // Initialize stats for each sales rep
    salesReps?.forEach((rep: any) => {
      salesRepStats[rep.email] = {
        email: rep.email,
        name: rep.name || rep.email,
        totalDemos: 0,
        onboardedRestaurants: 0,
        conversionRate: 0,
        demosLast30Days: 0,
        onboardedLast30Days: 0,
        avgTimeToConversion: null,
        totalRevenue: 0
      }
    })

    // Process restaurants
    const conversionTimes: Record<string, number[]> = {}
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    restaurants?.forEach((restaurant: any) => {
      const createdBy = restaurant.created_by
      if (!createdBy || !salesRepStats[createdBy]) return

      const stats = salesRepStats[createdBy]
      stats.totalDemos++

      // Check if created in last 30 days
      if (new Date(restaurant.created_at) >= thirtyDaysAgo) {
        stats.demosLast30Days++
      }

      // Check if onboarded AND active (paused restaurants don't count as onboarded)
      if (restaurant.is_onboarded && restaurant.owner_email && restaurant.is_active) {
        stats.onboardedRestaurants++
        
        if (new Date(restaurant.created_at) >= thirtyDaysAgo) {
          stats.onboardedLast30Days++
        }

        // Track conversion time (time from creation to onboarding)
        // For now, we'll use created_at as proxy (in real scenario, track onboarding date)
        if (!conversionTimes[createdBy]) {
          conversionTimes[createdBy] = []
        }
        // Assume conversion happened at creation for demos that are already onboarded
        conversionTimes[createdBy].push(0) // Placeholder - would need onboarding_date field
      }
    })

    // Calculate conversion rates and average conversion times
    Object.values(salesRepStats).forEach(stats => {
      if (stats.totalDemos > 0) {
        stats.conversionRate = Math.round((stats.onboardedRestaurants / stats.totalDemos) * 100)
      }
      
      if (conversionTimes[stats.email] && conversionTimes[stats.email].length > 0) {
        const times = conversionTimes[stats.email]
        stats.avgTimeToConversion = Math.round(
          times.reduce((a, b) => a + b, 0) / times.length
        )
      }
    })

    // Calculate summary stats
    const summary = {
      totalSalesReps: salesReps?.length || 0,
      totalDemos: restaurants?.length || 0,
      totalOnboarded: restaurants?.filter((r: any) => r.is_onboarded && r.owner_email && r.is_active).length || 0,
      overallConversionRate: restaurants && restaurants.length > 0
        ? Math.round((restaurants.filter((r: any) => r.is_onboarded && r.owner_email && r.is_active).length / restaurants.length) * 100)
        : 0,
      demosLast30Days: restaurants?.filter((r: any) => 
        new Date(r.created_at) >= thirtyDaysAgo
      ).length || 0,
      onboardedLast30Days: restaurants?.filter((r: any) => 
        r.is_onboarded && r.owner_email && r.is_active && new Date(r.created_at) >= thirtyDaysAgo
      ).length || 0
    }

    return NextResponse.json({
      salesRepStats: Object.values(salesRepStats),
      summary,
      timeRangeDays: days
    })

  } catch (error) {
    console.error('Error fetching sales performance:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

