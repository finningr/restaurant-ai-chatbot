import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/users-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const dbUsers = await getAllUsers()
    const users = dbUsers.map((u) => ({
      email: u.email,
      id: u.id,
      name: u.name,
      role: u.role,
      hasChatbot: u.has_chatbot,
      status: u.status,
      restaurantName: u.restaurant_name,
      createdAt: u.created_at,
    }))
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

