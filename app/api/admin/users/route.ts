import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const usersFilePath = path.join(process.cwd(), 'users.json')
    
    if (!fs.existsSync(usersFilePath)) {
      return NextResponse.json([])
    }

    const fileContent = fs.readFileSync(usersFilePath, 'utf-8')
    const usersArray = JSON.parse(fileContent)
    
    // Convert from Map-like structure to array
    const users = Array.isArray(usersArray) 
      ? usersArray.map(([email, userData]: [string, any]) => ({
          email,
          ...userData
        }))
      : Object.entries(usersArray).map(([email, userData]: [string, any]) => ({
          email,
          ...userData
        }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

