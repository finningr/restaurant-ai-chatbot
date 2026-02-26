import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { userExists, createUser } from '@/lib/users-db'

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
      restaurantName,
      role: 'restaurant',
      hasChatbot: false,
    })

    if (createError) {
      console.error('createUser error:', createError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    console.log('New user created:', email)

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: newUserId,
          email,
          name,
          restaurantName
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