import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { loadUsers, saveUsers } from '../../../auth/[...nextauth]/route'
import { logActivity, getClientIP, getUserAgent } from '@/lib/activity-logger'

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

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const users = loadUsers()
    if (!users.has(email)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userToDelete = users.get(email)!
    if ((userToDelete as any)?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    const deletedName = (userToDelete as any)?.name ?? 'Unknown'
    const deletedRole = (userToDelete as any)?.role ?? 'unknown'

    users.delete(email)
    saveUsers(users)

    // Log deletion for audit trail (non-blocking)
    await logActivity({
      user_email: session.user!.email!,
      user_role: 'admin',
      action_type: 'delete_user',
      details: {
        deleted_user_email: email,
        deleted_user_name: deletedName,
        deleted_user_role: deletedRole,
      },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted. You can re-invite this email.',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
