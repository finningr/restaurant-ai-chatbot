import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Hours structure: main (required for schedule), optional kitchen, pickup, happy_hour, holiday, brunch, bar
type HoursStructure = {
  main?: Record<string, string>
  kitchen?: Record<string, string>
  pickup?: Record<string, string>
  happy_hour?: string
  holiday?: string
  brunch?: string
  bar?: string
}

function parseDayHoursWithAI(openai: OpenAI, text: string): Promise<Record<string, string>> {
  return openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a business hours parser. Take any hours format and convert it to structured JSON.
Return a JSON object with days of the week as keys and hours as values.
Days: monday, tuesday, wednesday, thursday, friday, saturday, sunday
Examples: "Mon-Fri 9am-10pm" → {"monday":"9am-10pm","tuesday":"9am-10pm",...}
If a day is not mentioned, use null. Use "Closed" for closed days.`
      },
      { role: "user", content: text }
    ],
    temperature: 0.1,
    max_completion_tokens: 300,
  }).then(async (res) => {
    const raw = res.choices[0]?.message?.content?.trim() || '{}'
    const clean = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '')
    const parsed = JSON.parse(clean || '{}')
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  }).catch(() => ({}))
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email, address, hours, hoursMain, hoursKitchen, hoursPickup, hoursHappyHour, hoursHoliday, hoursBrunch, hoursBar } = await request.json()
    const hasHours = hours || hoursMain || hoursKitchen || hoursPickup || hoursHappyHour || hoursHoliday || hoursBrunch || hoursBar

    if (!phone && !email && !address && !hasHours) {
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
              content: `You are a phone number formatter. Take any phone number format and convert it to a standardized US format.

Rules:
- Assume all numbers are US numbers (do NOT add country code +1)
- Format as: (XXX) XXX-XXXX for US numbers
- Remove any extra characters like dots, but keep parentheses and dashes in standard format
- If the number is clearly incomplete or invalid, return null

Examples:
- "(303) 376-9954" → "(303) 376-9954"
- "303.376.9954" → "(303) 376-9954"
- "303-376-9954" → "(303) 376-9954"
- "3033769954" → "(303) 376-9954"
- "+1-303-376-9954" → "(303) 376-9954"
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

    // Parse hours into multi-type structure
    if (hasHours) {
      const hoursResult: HoursStructure = {}

      try {
        // Case 1: Single blob (legacy) - parse into full structure
        if (hours && typeof hours === 'string' && !hoursMain && !hoursPickup) {
          const blobCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You parse restaurant hours text into a structured JSON object. Extract main hours, and any of: kitchen, pickup/takeout, happy hour, holiday, brunch, bar.

Return JSON with keys: main, kitchen (optional), pickup (optional), happy_hour (optional), holiday (optional), brunch (optional), bar (optional).

- main: object with monday..sunday. Values like "9am-10pm" or "Closed". Dining/operating hours.
- kitchen: same format if kitchen/last-order hours differ from main (e.g. kitchen closes 30 min before); omit if same or not mentioned.
- pickup: same format if pickup/takeout/carryout hours differ from main; omit if same or not mentioned.
- happy_hour, holiday, brunch, bar: strings (e.g. "Mon-Fri 3-6pm", "Thanksgiving: Closed"); omit if not mentioned.

Example input: "Mon-Fri 11am-10pm, Sat-Sun 10am-11pm. Happy hour Mon-Fri 3-6pm. Carryout closes 30 min before."
Output: {"main":{"monday":"11am-10pm",...},"pickup":{"monday":"11am-9:30pm",...},"happy_hour":"Mon-Fri 3-6pm"}

Return ONLY valid JSON, no markdown.`
              },
              { role: "user", content: hours }
            ],
            temperature: 0.1,
            max_completion_tokens: 500,
          })
          const raw = blobCompletion.choices[0]?.message?.content?.trim() || '{}'
          const clean = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '')
          const parsed = JSON.parse(clean || '{}') as HoursStructure
          if (parsed.main) hoursResult.main = parsed.main
          if (parsed.kitchen) hoursResult.kitchen = parsed.kitchen
          if (parsed.pickup) hoursResult.pickup = parsed.pickup
          if (parsed.happy_hour) hoursResult.happy_hour = parsed.happy_hour
          if (parsed.holiday) hoursResult.holiday = parsed.holiday
          if (parsed.brunch) hoursResult.brunch = parsed.brunch
          if (parsed.bar) hoursResult.bar = parsed.bar
          // Fallback: if AI returned flat object, treat as main
          if (!hoursResult.main && typeof parsed === 'object' && !parsed.main && Object.keys(parsed).some(k => ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(k.toLowerCase()))) {
            hoursResult.main = parsed as unknown as Record<string, string>
          }
        } else {
          // Case 2: Individual fields
          if (hoursMain && typeof hoursMain === 'string') {
            hoursResult.main = await parseDayHoursWithAI(openai, hoursMain)
          }
          if (hoursKitchen && typeof hoursKitchen === 'string') {
            hoursResult.kitchen = await parseDayHoursWithAI(openai, hoursKitchen)
          }
          if (hoursPickup && typeof hoursPickup === 'string') {
            hoursResult.pickup = await parseDayHoursWithAI(openai, hoursPickup)
          }
          if (hoursHappyHour && typeof hoursHappyHour === 'string') {
            hoursResult.happy_hour = hoursHappyHour.trim()
          }
          if (hoursHoliday && typeof hoursHoliday === 'string') {
            hoursResult.holiday = hoursHoliday.trim()
          }
          if (hoursBrunch && typeof hoursBrunch === 'string') {
            hoursResult.brunch = hoursBrunch.trim()
          }
          if (hoursBar && typeof hoursBar === 'string') {
            hoursResult.bar = hoursBar.trim()
          }
        }

        if (Object.keys(hoursResult).length > 0) {
          results.hours = hoursResult
        } else if (hours && typeof hours === 'string') {
          results.hours = hours
        }
      } catch (error) {
        console.error('Hours parsing error:', error)
        if (hours && typeof hours === 'string') results.hours = hours
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
