import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// File-based storage
const usersFile = path.join(process.cwd(), 'users.json')

// Load users from file or create default
function loadUsers() {
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8')
      return new Map(JSON.parse(data))
    }
  } catch (error) {
    console.log('Error loading users, creating new store')
  }
  
  // Create new users map with admin
  const users = new Map()
  const adminPassword = bcrypt.hashSync('admin123', 10)
  users.set('admin@restaurantai.com', {
    id: 'admin-1',
    email: 'admin@restaurantai.com',
    password: adminPassword,
    name: 'Admin User',
    restaurantName: 'RestaurantAI',
    role: 'admin',
    hasChatbot: true,
    createdAt: new Date().toISOString()
  })
  saveUsers(users)
  return users
}

function saveUsers(users: Map<any, any>) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(Array.from(users.entries())))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

const users = loadUsers()

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

        // Reload users to get latest
        const currentUsers = loadUsers()
        const user = currentUsers.get(credentials.email)
        
        if (!user) {
          console.log('User not found:', credentials.email)
          console.log('Available users:', Array.from(currentUsers.keys()))
          return null
        }

        // Check if user is paused or deleted
        const userStatus = user.status || 'active'
        if (userStatus === 'paused' || userStatus === 'deleted') {
          console.log(`Login blocked: User is ${userStatus}`)
          return null
        }

        console.log('Checking password...')
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
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-123',
  debug: process.env.NODE_ENV === 'development',
}

// Export functions for signup
export { users, loadUsers, saveUsers }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }