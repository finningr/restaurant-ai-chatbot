import { NextRequest, NextResponse } from 'next/server'
import { getInviteByToken } from '@/lib/invites'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const invite = await getInviteByToken(token)

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired link' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      name: invite.name,
      role: invite.role,
    })
  } catch (error) {
    console.error('Validate invite error:', error)
    return NextResponse.json(
      { valid: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
