import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, loadUsers } from '../../auth/[...nextauth]/route'
import { createInvite, getInviteByEmail, deleteInvite, generateInviteToken } from '@/lib/invites'
import { sendInviteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const VALID_ROLES = ['restaurant', 'sales_rep']

export async function POST(request: NextRequest) {
  try {
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

    const { email, name, role } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    const roleToAssign = role || 'restaurant'
    if (!VALID_ROLES.includes(roleToAssign)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const users = loadUsers()
    if (users.has(email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingInvite = await getInviteByEmail(email)
    if (existingInvite) {
      await deleteInvite(existingInvite.token)
    }

    const token = generateInviteToken()
    const { error: inviteError } = await createInvite({
      token,
      email,
      name,
      role: roleToAssign,
      createdBy: session.user?.email || 'unknown',
    })

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError || 'Failed to create invite' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const { error: emailError } = await sendInviteEmail({
      to: email,
      name,
      role: roleToAssign,
      token,
    })

    if (emailError) {
      const setupUrl = `${appUrl}/setup-account?token=${token}`
      return NextResponse.json(
        {
          error: `Invite created but email failed to send: ${emailError}. Share this link manually: ${setupUrl}`,
          setupUrl,
        },
        { status: 500 }
      )
    }

    console.log(`Admin ${session.user?.email} sent invite to ${email} (role: ${roleToAssign})`)

    return NextResponse.json(
      {
        message: 'Invite sent successfully',
        email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Invite user error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send invite'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
