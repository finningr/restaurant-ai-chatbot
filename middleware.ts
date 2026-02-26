import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-at-least-32-characters-long',
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
