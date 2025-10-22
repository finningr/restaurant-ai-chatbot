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

        console.log('Checking password...')
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Login successful!')
        
        // Return minimal user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-123',
}

// Export functions for signup
export { users, loadUsers, saveUsers }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }