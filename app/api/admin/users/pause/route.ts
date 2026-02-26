import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getUserByEmail, updateUserStatus } from '@/lib/users-db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { error: updateError } = await updateUserStatus(email, status as 'active' | 'paused' | 'deleted')
    if (updateError) {
      console.error('updateUserStatus error:', updateError)
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        status
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

