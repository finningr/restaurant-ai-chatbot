import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { loadUsers, saveUsers } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, restaurantName } = await request.json()

    // Validation
    if (!email || !password || !name || !restaurantName) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      restaurantName,
      role: 'restaurant' as const,
      hasChatbot: false,
      createdAt: new Date().toISOString()
    }

    users.set(email, newUser)
    saveUsers(users)

    console.log('New user created:', email)
    console.log('Total users now:', users.size)

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          restaurantName: newUser.restaurantName
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}