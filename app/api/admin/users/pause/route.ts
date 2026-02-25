import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function loadUsers() {
  const usersFile = path.join(process.cwd(), 'users.json')
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8')
      return new Map(JSON.parse(data))
    }
  } catch (error) {
    console.log('Error loading users, creating new store')
  }
  return new Map()
}

function saveUsers(users: Map<any, any>) {
  const usersFile = path.join(process.cwd(), 'users.json')
  try {
    const usersArray = Array.from(users.entries())
    fs.writeFileSync(usersFile, JSON.stringify(usersArray, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, status } = await request.json()

    if (!email || !status) {
      return NextResponse.json(
        { error: 'Email and status are required' },
        { status: 400 }
      )
    }

    if (!['active', 'paused', 'deleted'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, paused, or deleted' },
        { status: 400 }
      )
    }

    const users = loadUsers()
    const user = users.get(email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user status
    user.status = status
    users.set(email, user)
    saveUsers(users)

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      },
      message: status === 'paused' 
        ? 'User paused successfully' 
        : status === 'deleted'
        ? 'User deleted successfully'
        : 'User activated successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

