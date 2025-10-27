import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { phone, email, address, hours } = await request.json()

    if (!phone && !email && !address && !hours) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 })
    }

    const results: any = {}

    // Format phone number
    if (phone) {
      try {
        const phoneCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a phone number formatter. Take any phone number format and convert it to a standardized format.

Rules:
- Always include country code if missing (assume US +1 if not specified)
- Format as: +1-XXX-XXX-XXXX for US numbers
- For international numbers, use appropriate country code
- Remove any extra characters like parentheses, spaces, dots, etc.
- If the number is clearly incomplete or invalid, return null

Examples:
- "(303) 376-9954" → "+1-303-376-9954"
- "303.376.9954" → "+1-303-376-9954"
- "303-376-9954" → "+1-303-376-9954"
- "3033769954" → "+1-303-376-9954"
- "+44 20 7946 0958" → "+44-20-7946-0958"
- "invalid" → null`
            },
            {
              role: "user",
              content: phone
            }
          ],
          temperature: 0.1,
          max_completion_tokens: 50,
        })

        const formattedPhone = phoneCompletion.choices[0]?.message?.content?.trim()
        results.phone = formattedPhone === 'null' ? null : formattedPhone
      } catch (error) {
        console.error('Phone formatting error:', error)
        results.phone = phone // Fallback to original
      }
    }

    // Format email
    if (email) {
      try {
        const emailCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an email formatter. Take any email format and convert it to a standardized format.

Rules:
- Convert to lowercase
- Remove any extra spaces
- If the email is clearly invalid, return null
- Keep the original format if it's already valid

Examples:
- "INFO@RESTAURANT.COM" → "info@restaurant.com"
- " info@restaurant.com " → "info@restaurant.com"
- "invalid-email" → null`
            },
            {
              role: "user",
              content: email
            }
          ],
          temperature: 0.1,
          max_completion_tokens: 50,
        })

        const formattedEmail = emailCompletion.choices[0]?.message?.content?.trim()
        results.email = formattedEmail === 'null' ? null : formattedEmail
      } catch (error) {
        console.error('Email formatting error:', error)
        results.email = email // Fallback to original
      }
    }

    // Parse address into structured fields
    if (address) {
      try {
        const addressCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an address parser. Take any address format and split it into structured fields.

Return a JSON object with these fields:
- street: Street address (e.g., "123 Main St")
- city: City name (e.g., "Denver")
- state: State/province (e.g., "CO")
- zip: ZIP/postal code (e.g., "80202")
- country: Country (default to "USA" if not specified)

Examples:
Input: "123 Main St, Denver, CO 80202"
Output: {"street": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}

Input: "456 Oak Avenue, San Francisco, CA 94102"
Output: {"street": "456 Oak Avenue", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "USA"}

Input: "789 King St, Toronto, ON M5V 3A8, Canada"
Output: {"street": "789 King St", "city": "Toronto", "state": "ON", "zip": "M5V 3A8", "country": "Canada"}

If any field cannot be determined, use null.`
            },
            {
              role: "user",
              content: address
            }
          ],
          temperature: 0.1,
          max_completion_tokens: 200,
        })

        const addressResponse = addressCompletion.choices[0]?.message?.content?.trim()
        
        // Strip markdown code blocks if present
        let cleanResponse = addressResponse || ''
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const parsedAddress = JSON.parse(cleanResponse)
        results.address = parsedAddress
      } catch (error) {
        console.error('Address parsing error:', error)
        results.address = {
          street: address,
          city: null,
          state: null,
          zip: null,
          country: "USA"
        }
      }
    }

    // Parse hours into structured JSON
    if (hours) {
      try {
        const hoursCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a business hours parser. Take any hours format and convert it to structured JSON.

Return a JSON object with days of the week as keys and hours as values.

Days: monday, tuesday, wednesday, thursday, friday, saturday, sunday

Examples:
Input: "Mon-Fri 9am-10pm, Sat-Sun 10am-11pm"
Output: {
  "monday": "9am-10pm",
  "tuesday": "9am-10pm", 
  "wednesday": "9am-10pm",
  "thursday": "9am-10pm",
  "friday": "9am-10pm",
  "saturday": "10am-11pm",
  "sunday": "10am-11pm"
}

Input: "Open daily 11am-9pm"
Output: {
  "monday": "11am-9pm",
  "tuesday": "11am-9pm",
  "wednesday": "11am-9pm", 
  "thursday": "11am-9pm",
  "friday": "11am-9pm",
  "saturday": "11am-9pm",
  "sunday": "11am-9pm"
}

Input: "Monday: 9am-5pm, Tuesday: 9am-5pm, Wednesday: Closed, Thursday: 9am-5pm, Friday: 9am-5pm, Saturday: 10am-4pm, Sunday: Closed"
Output: {
  "monday": "9am-5pm",
  "tuesday": "9am-5pm",
  "wednesday": "Closed",
  "thursday": "9am-5pm", 
  "friday": "9am-5pm",
  "saturday": "10am-4pm",
  "sunday": "Closed"
}

If a day is not mentioned, use null for that day.`
            },
            {
              role: "user",
              content: hours
            }
          ],
          temperature: 0.1,
          max_completion_tokens: 300,
        })

        const hoursResponse = hoursCompletion.choices[0]?.message?.content?.trim()
        const parsedHours = JSON.parse(hoursResponse || '{}')
        results.hours = parsedHours
      } catch (error) {
        console.error('Hours parsing error:', error)
        results.hours = {
          monday: hours,
          tuesday: hours,
          wednesday: hours,
          thursday: hours,
          friday: hours,
          saturday: hours,
          sunday: hours
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      formatted: results 
    })

  } catch (error) {
    console.error('Error formatting contact info:', error)
    return NextResponse.json({ error: 'Failed to format contact information' }, { status: 500 })
  }
}
