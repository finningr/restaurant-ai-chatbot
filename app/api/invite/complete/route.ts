import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getInviteByToken, deleteInvite } from '@/lib/invites'
import { userExists, createUser } from '@/lib/users-db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const invite = await getInviteByToken(token)

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or already used link. Please request a new invite.' },
        { status: 400 }
      )
    }

    if (await userExists(invite.email)) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { error: createError } = await createUser({
      id: `user-${Date.now()}`,
      email: invite.email,
      password: hashedPassword,
      name: invite.name,
      role: invite.role,
      hasChatbot: invite.role === 'admin',
    })

    if (createError) {
      console.error('createUser error:', createError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    const { error: deleteError } = await deleteInvite(token)
    if (deleteError) {
      console.error('Failed to delete invite after account creation:', deleteError)
      // Don't fail - user is created, invite will just linger
    }

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Complete invite error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
