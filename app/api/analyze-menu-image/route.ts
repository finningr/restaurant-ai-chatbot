import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { image, extractHours } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
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

    // Extract menu items from image
    console.log('🤖 Analyzing menu image with GPT-4 Vision...')

    // Send to GPT-4 Vision for analysis (using gpt-4o which has vision capabilities)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing a restaurant menu image. Extract ALL menu items you can see.

Return ONLY a JSON array in this exact format (no markdown, no explanation):

[
  {
    "name": "item name",
    "price": "12.99",
    "description": "description of the item",
    "category": "Appetizer/Main Course/Dessert/Beverage"
  }
]

Extract EVERY item visible with accurate prices. If no price is shown, use "0.00". Be thorough and accurate.`
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

    const content = response.choices[0]?.message?.content || '[]'
    console.log('✅ GPT-4 Vision response received')

    // Parse the JSON response
    let menuItems
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      menuItems = JSON.parse(jsonString)
    } catch (e) {
      console.error('Failed to parse GPT-4 response:', e)
      // Try to extract the array directly
      try {
        const arrayMatch = content.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          menuItems = JSON.parse(arrayMatch[0])
        } else {
          throw new Error('No valid JSON found')
        }
      } catch (e2) {
        return NextResponse.json({ 
          error: 'Failed to parse menu data from image',
          rawResponse: content
        }, { status: 500 })
      }
    }

    console.log(`✅ Extracted ${menuItems.length} menu items from image`)

    return NextResponse.json({
      success: true,
      menuItems: menuItems,
      count: menuItems.length
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

