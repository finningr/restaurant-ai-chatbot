import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { loadUsers, saveUsers } from '../../auth/[...nextauth]/route'

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

    // Load current users
    const users = loadUsers()

    // Check if user already exists
    if (users.has(email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser: any = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: userRoleToCreate,
      hasChatbot: userRoleToCreate === 'admin',
      status: 'active', // Default status for new users
      createdAt: new Date().toISOString()
    }
    
    // Only set restaurantName for restaurant owners
    if (userRoleToCreate === 'restaurant' && restaurantName) {
      newUser.restaurantName = restaurantName
    }

    users.set(email, newUser)
    saveUsers(users)

    console.log(`Admin ${session.user?.email} created new user: ${email} with role: ${userRoleToCreate}`)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
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

