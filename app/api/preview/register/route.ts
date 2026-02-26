import { NextRequest, NextResponse } from 'next/server'
import { generatePreviewToken, setPreviewData } from '@/lib/preview-cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = generatePreviewToken()
    setPreviewData(token, body)
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Preview register error:', error)
    return NextResponse.json({ error: 'Failed to register preview' }, { status: 500 })
  }
}
