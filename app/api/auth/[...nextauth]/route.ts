import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail } from '@/lib/users-db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Login attempt:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const user = await getUserByEmail(credentials.email)
        
        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }

        // Check if user is paused or deleted
        const userStatus = user.status || 'active'
        if (userStatus === 'paused' || userStatus === 'deleted') {
          console.log(`Login blocked: User is ${userStatus}`)
          return null
        }

        console.log('Checking password...')
        const bcrypt = require('bcryptjs')
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Login successful!')
        
        // Return user object with role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'restaurant', // Include role in user object
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token when user signs in
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-at-least-32-characters-long',
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }