import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import puppeteer from 'puppeteer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let browser = null
  
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('🚀 Starting visual extraction for:', url)

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 1024 })

    // Navigate to the website
    console.log('📸 Loading website...')
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })

    // Wait a bit for any animations/content to load
    await page.waitForTimeout(2000)

    // Take screenshot of the full page
    console.log('📸 Taking screenshot...')
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true
    })

    await browser.close()
    browser = null

    // Send to GPT-4 Vision for analysis
    console.log('🤖 Analyzing with GPT-4 Vision...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing a restaurant website screenshot. Extract ALL of the following information in JSON format:

{
  "restaurantName": "exact name",
  "hours": "complete operating hours",
  "phone": "phone number",
  "email": "email address",
  "address": "physical address",
  "menuItems": [
    {
      "name": "item name",
      "price": "price as number (e.g., 12.99)",
      "description": "description",
      "category": "category (Appetizer, Main Course, Dessert, Beverage, etc.)"
    }
  ]
}

Extract EVERY menu item you can see with accurate prices and descriptions. If you see a menu section, extract all items from it. Be thorough and accurate.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshot}`
              }
            }
          ]
        }
      ]
    })

    const content = response.choices[0]?.message?.content || '{}'
    console.log('✅ GPT-4 Vision response:', content.substring(0, 200))

    // Parse the JSON response
    let extractedData
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      extractedData = JSON.parse(jsonString)
    } catch (e) {
      console.error('Failed to parse GPT-4 response:', e)
      return NextResponse.json({ 
        error: 'Failed to extract structured data from website',
        rawResponse: content
      }, { status: 500 })
    }

    console.log('✅ Extracted data:', {
      restaurantName: extractedData.restaurantName,
      menuItemsCount: extractedData.menuItems?.length || 0,
      hasHours: !!extractedData.hours
    })

    return NextResponse.json({
      success: true,
      data: extractedData
    })

  } catch (error: any) {
    console.error('Vision extraction error:', error)
    
    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      { error: error.message || 'Failed to extract data from website' },
      { status: 500 }
    )
  }
}




