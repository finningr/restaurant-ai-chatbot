import { Resend } from 'resend'

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Front of House <onboarding@resend.dev>'
// Use NEXTAUTH_URL for invite links when running locally so setup + login happen on same server
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendInviteEmail(params: {
  to: string
  name: string
  role: string
  token: string
}): Promise<{ error?: string }> {
  const resend = getResendClient()
  if (!resend) {
    return { error: 'RESEND_API_KEY not set. Add it to .env.local and restart the dev server.' }
  }

  if (FROM_EMAIL.includes('resend.dev')) {
    return {
      error: `RESEND_FROM_EMAIL not set or not loaded. Add RESEND_FROM_EMAIL="Front of House <noreply@frontofhouseai.com>" to .env.local and restart the dev server. Domain must be verified at resend.com/domains.`,
    }
  }

  const setupUrl = `${APP_URL}/setup-account?token=${params.token}`
  const roleLabel = params.role === 'sales_rep' ? 'Sales Representative' : 'Restaurant Account Manager'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're invited to Front of House</h2>
      <p>Hi ${params.name},</p>
      <p>You've been invited to join as a <strong>${roleLabel}</strong>.</p>
      <p>Click the button below to create your account and set your password:</p>
      <p style="margin: 24px 0;">
        <a href="${setupUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Create Account</a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link: ${setupUrl}</p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">If you didn't expect this invite, you can ignore this email.</p>
    </div>
  `

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [params.to],
    subject: "You're invited to Front of House",
    html,
  })

  if (error) {
    console.error('Send invite email error:', error)
    const msg = typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: string }).message)
      : String(error)
    return { error: msg }
  }

  return {}
}
