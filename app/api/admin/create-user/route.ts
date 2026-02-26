import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { userExists, createUser } from '@/lib/users-db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    // In App Router, getServerSession needs to be called with authOptions
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { email, password, name, role, restaurantName } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['restaurant', 'sales_rep', 'admin']
    const userRoleToCreate = role || 'restaurant'
    
    if (!validRoles.includes(userRoleToCreate)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (await userExists(email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUserId = `user-${Date.now()}`

    const { error: createError } = await createUser({
      id: newUserId,
      email,
      password: hashedPassword,
      name,
      role: userRoleToCreate,
      hasChatbot: userRoleToCreate === 'admin',
      restaurantName: userRoleToCreate === 'restaurant' ? restaurantName : undefined,
    })

    if (createError) {
      console.error('createUser error:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log(`Admin ${session.user?.email} created new user: ${email} with role: ${userRoleToCreate}`)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUserId,
          email,
          name,
          role: userRoleToCreate
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

