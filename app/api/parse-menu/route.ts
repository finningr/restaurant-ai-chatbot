import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { menuText } = await request.json()

    if (!menuText) {
      return NextResponse.json({ error: 'Menu text is required' }, { status: 400 })
    }
    
    console.log(`Received menu text:`, JSON.stringify(menuText))
    console.log(`Menu text length:`, menuText.length)

    // Use GPT-4o for now since it was working correctly
    const tryModels = ["gpt-4o"] as const
    let parsedMenu = []
    let lastError = null

    for (const model of tryModels) {
      try {
        console.log(`Attempting to parse menu with ${model}...`)
        // Let GPT-4o try with the working prompt
        
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are a restaurant menu parser. Extract menu items with their exact prices from the provided menu text.

CRITICAL PRICE EXTRACTION RULES:
- READ the actual price from the menu text
- If you see "Chicken Tandoori - $15.99", extract price as 15.99
- If you see "Gobi Manchurian (GF/DF) - $9.99", extract price as 9.99  
- If you see "$10", extract price as 10
- If you see "$15.99", extract price as 15.99
- NEVER use 0.99 or any default price - ALWAYS use the actual price from the menu
- Look for dollar signs ($) and extract the number that follows

DIETARY TAGS:
- Extract dietary tags like (GF), (DF), (V), (VG) from the menu text
- Convert to array format: ["GF", "DF"]
- NORMALIZE tags: "DF Option" becomes "DF", "GF Option" becomes "GF"
- Only use standard tags: GF, DF, V, VG, NF, Keto, Halal, Kosher
- Remove "Option" from any dietary tags

CATEGORIES:
- Categorize items appropriately (Appetizers, Main Course, Desserts, etc.)

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
- Always return at least one item if the menu text contains any food items
- Never return an empty array
- Use the EXACT price shown in the menu text, not 0.99
- Normalize dietary tags to remove "Option" text

EXAMPLES:
Input: "Chicken Tandoori - $15.99"
Output: [{"name": "Chicken Tandoori", "price": 15.99, "category": "Main Course", "description": "", "dietaryTags": []}]

Input: "Gobi Manchurian (GF/DF) - $9.99"
Output: [{"name": "Gobi Manchurian", "price": 9.99, "category": "Main Course", "description": "", "dietaryTags": ["GF", "DF"]}]

Input: "Soup (DF Option) - $6.99"
Output: [{"name": "Soup", "price": 6.99, "category": "Soup", "description": "", "dietaryTags": ["DF"]}]`
            },
            {
              role: "user",
              content: menuText
            }
          ],
          temperature: 0.3,
          max_completion_tokens: 16000,
        })

        const response = completion.choices[0]?.message?.content || '[]'
        console.log(`${model} response:`, response.substring(0, 200) + '...')
        console.log(`${model} full response:`, response)
        
        // Clean the response - remove markdown code blocks if present
        let cleanResponse = response.trim()
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        console.log(`${model} cleaned response:`, cleanResponse)
        
        parsedMenu = JSON.parse(cleanResponse)
        console.log(`${model} parsed result:`, JSON.stringify(parsedMenu, null, 2))
        
        if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
          // Check if prices are correct (not 0.99 defaults)
          const hasCorrectPrices = parsedMenu.some((item: any) => item.price && item.price > 1 && item.price !== 0.99)
          console.log(`Price validation: hasCorrectPrices=${hasCorrectPrices}, items:`, parsedMenu.map((item: any) => ({ name: item.name, price: item.price })))
          if (hasCorrectPrices) {
            console.log(`Successfully parsed ${parsedMenu.length} menu items with ${model}`)
            break
          } else {
            console.log(`${model} returned items with incorrect prices (0.99), forcing fallback...`)
            throw new Error('Incorrect price extraction - using fallback')
          }
        } else {
          console.log(`${model} failed: Invalid response format`)
          throw new Error('Invalid response format')
        }
        
      } catch (error) {
        console.log(`${model} failed:`, error instanceof Error ? error.message : String(error))
        lastError = error
        continue
      }
    }

    if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
      return NextResponse.json({ 
        success: true, 
        menuItems: parsedMenu 
      })
    } else {
      console.error('GPT-4o model failed:', lastError)
      console.log('Attempting fallback parsing...')
      
      // Fallback: Simple regex-based parsing
      const fallbackItems: any[] = []
      const lines = menuText.split('\n').filter((line: string) => line.trim())
      
      console.log(`Fallback parsing menu text:`, JSON.stringify(menuText))
    console.log(`Fallback parsing menu text length:`, menuText.length)
      console.log(`Fallback parsing lines:`, lines)
      
      for (const line of lines) {
        console.log(`Processing line: "${line}"`)
        const priceMatch = line.match(/\$(\d+\.?\d*)/)
        console.log(`Price match for "${line}":`, priceMatch)
        if (priceMatch) {
          const price = parseFloat(priceMatch[1])
          const name = line.replace(/\$[\d.]+.*$/, '').trim()
          console.log(`Found price: ${price}, name: "${name}"`)
          if (name && price > 0) {
            fallbackItems.push({
              name: name,
              price: price,
              category: "Main Course",
              description: "",
              dietaryTags: []
            })
          }
        }
      }
      
      console.log(`Fallback parsing extracted ${fallbackItems.length} items:`, fallbackItems)
      
      if (fallbackItems.length > 0) {
        console.log(`Fallback parsing extracted ${fallbackItems.length} items`)
        return NextResponse.json({ 
          success: true, 
          menuItems: fallbackItems 
        })
      } else {
        console.log('Fallback parsing failed - no items extracted')
        return NextResponse.json({ error: 'Failed to parse menu with GPT-4o and fallback' }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('Error parsing menu:', error)
    return NextResponse.json({ error: 'Failed to parse menu' }, { status: 500 })
  }
}