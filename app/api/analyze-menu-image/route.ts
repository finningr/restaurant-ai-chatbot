import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Server error: OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    const { image, images, extractHours, menuType } = await request.json()

    // Support both single image and multiple images
    const imagesToProcess = images && Array.isArray(images) ? images : (image ? [image] : [])

    if (imagesToProcess.length === 0) {
      return NextResponse.json({ error: 'Image or images are required' }, { status: 400 })
    }

    if (extractHours) {
      // Extract hours from image
      console.log('🤖 Extracting hours from image with GPT-4 Vision...')

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are analyzing an image that shows restaurant hours of operation.

Extract the hours and return them in a clean, readable format. Example output:

Mon-Fri: 11:00 AM - 10:00 PM
Sat-Sun: 10:00 AM - 11:00 PM

Return ONLY the formatted hours text, nothing else.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ]
      })

      const hours = response.choices[0]?.message?.content?.trim() || ''
      console.log('✅ Extracted hours:', hours)

      return NextResponse.json({
        success: true,
        hours: hours
      })
    }

    // Extract menu items from image(s)
    console.log(`🤖 Analyzing ${imagesToProcess.length} menu image(s) with GPT-4 Vision...`)

    // Build content array with text prompt and all images
    const contentArray: any[] = [
      {
        type: 'text',
        text: `You are a restaurant menu parser analyzing menu image${imagesToProcess.length > 1 ? 's' : ''}. Extract menu items with their exact prices from the provided menu image${imagesToProcess.length > 1 ? 's' : ''}.

CRITICAL PRICE EXTRACTION RULES:
- READ the actual price from the menu image
- If you see "Chicken Tandoori - $15.99", extract price as 15.99
- If you see "Gobi Manchurian (GF/DF) - $9.99", extract price as 9.99  
- If you see "$10", extract price as 10
- If you see "$15.99", extract price as 15.99
- NEVER use 0.99 or any default price - ALWAYS use the actual price from the menu
- Look for dollar signs ($) and extract the number that follows

DIETARY TAGS:
- Extract dietary tags like (GF), (DF), (V), (VG) from the menu image
- Convert to array format: ["GF", "DF"]
- NORMALIZE tags: "DF Option" becomes "DF", "GF Option" becomes "GF"
- Only use standard tags: GF, DF, V, VG, NF, Keto, Halal, Kosher
- Remove "Option" from any dietary tags

CATEGORIES:
- Categorize items appropriately based on menu sections (Appetizers, Main Course, Desserts, Sushi Rolls, Tacos, Salads, etc.)
- Use the category names you see in the menu (e.g., "SUSHI ROLLS", "APPETIZERS", "TACOS", "ON A ROLL", "CARIBBEAN FLATBREADS", "PRIME BURGERS", "CARIBBEAN BOWLS", "SALADS", "SPECIALTY PLATES")

Return a JSON array in this EXACT format:
[
  {
    "name": "Item Name",
    "price": 15.99,
    "category": "Main Course", 
    "description": "Item description",
    "dietaryTags": ["GF", "DF"]
  }
]

IMPORTANT: 
- Always return at least one item if the menu image contains any food items
- Never return an empty array
- Use the EXACT price shown in the menu image, not 0.99
- Normalize dietary tags to remove "Option" text
- Extract ALL items from ALL sections of the menu
- Be thorough and extract every single menu item you can see
- If multiple images are provided, extract items from ALL images`
      }
    ]

    // Add all images to the content array
    imagesToProcess.forEach((img: string) => {
      contentArray.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${img}`
        }
      })
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 16000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: contentArray
        }
      ]
    })

    const content = response.choices[0]?.message?.content || '[]'
    console.log('✅ GPT-4 Vision response received')

    // Parse the JSON response
    let menuItems
    try {
      // Try to extract JSON from markdown code blocks if present
      let cleanResponse = content.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      menuItems = JSON.parse(cleanResponse)
      
      if (!Array.isArray(menuItems)) {
        throw new Error('Response is not an array')
      }
    } catch (e) {
      console.error('Failed to parse GPT-4 response:', e)
      console.error('Response content:', content.substring(0, 1000))
      // Try to extract the array directly
      try {
        const arrayMatch = content.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          menuItems = JSON.parse(arrayMatch[0])
        } else {
          throw new Error('No valid JSON found')
        }
      } catch (e2) {
        console.error('Failed to parse menu data from images:', e2)
        return NextResponse.json({ 
          error: 'Failed to parse menu data from images',
          rawResponse: content.substring(0, 500)
        }, { status: 500 })
      }
    }

    // Normalize menu items to match parse-menu format
    const normalizedMenuItems = (menuItems || []).map((item: any) => ({
      name: item.name || '',
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0),
      category: item.category || 'Main Course',
      description: item.description || '',
      dietaryTags: item.dietaryTags || item.dietary_tags || []
    }))

    console.log(`✅ Extracted ${normalizedMenuItems.length} menu items from ${imagesToProcess.length} image(s)`)

    return NextResponse.json({
      success: true,
      menuItems: normalizedMenuItems,
      count: normalizedMenuItems.length
    })

  } catch (error: any) {
    console.error('❌ Menu image analysis error:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze menu image',
        details: error.type || 'Unknown error type'
      },
      { status: 500 }
    )
  }
}

