import { NextRequest, NextResponse } from 'next/server'
import { userExists } from '@/lib/users-db'
import { createInvite, getInviteByEmail, deleteInvite, generateInviteToken } from '@/lib/invites'
import { sendInviteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/** Public endpoint: Restaurant Account Managers sign up with name + email. */
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const trimmedName = String(name).trim()
    const trimmedEmail = String(email).trim().toLowerCase()

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (await userExists(trimmedEmail)) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      )
    }

    const existingInvite = await getInviteByEmail(trimmedEmail)
    if (existingInvite) {
      await deleteInvite(existingInvite.token)
    }

    const token = generateInviteToken()
    const { error: inviteError } = await createInvite({
      token,
      email: trimmedEmail,
      name: trimmedName,
      role: 'restaurant',
      createdBy: 'restaurant-beta-signup',
    })

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError || 'Failed to create invite' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { error: emailError } = await sendInviteEmail({
      to: trimmedEmail,
      name: trimmedName,
      role: 'restaurant',
      token,
    })

    if (emailError) {
      const setupUrl = `${appUrl}/setup-account?token=${token}`
      return NextResponse.json(
        {
          error: `We couldn't send the email: ${emailError}. You can use this link to create your account: ${setupUrl}`,
          setupUrl,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Check your email! We sent you a link to create your account.',
        email: trimmedEmail,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Restaurant beta invite error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send invite'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
