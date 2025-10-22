import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface ScrapedData {
  restaurantName: string
  description: string
  phone: string
  email: string
  address: string
  hours: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  menuItems: Array<{
    name: string
    category: string
    description: string
    price: string
    ingredients?: string
    allergens?: string[]
    dietaryTags?: string[]
  }>
  reviews: Array<{
    name: string
    rating: number
    text: string
  }>
  cuisine: string
}

// Extract colors from CSS and common patterns
function extractColors(html: string, $: cheerio.CheerioAPI): { primary: string; secondary: string; accent: string } {
  const colors = {
    primary: '#4F46E5', // Default primary
    secondary: '#6366F1', // Default secondary
    accent: '#818CF8' // Default accent
  }

  try {
    // Look for common color patterns in inline styles and classes
    const colorPatterns = [
      /background-color:\s*([#\w]+)/gi,
      /color:\s*([#\w]+)/gi,
      /rgb\((\d+),\s*(\d+),\s*(\d+)\)/gi
    ]

    const foundColors: string[] = []
    
    // Extract colors from style tags
    $('style').each((_, elem) => {
      const styleContent = $(elem).html() || ''
      colorPatterns.forEach(pattern => {
        const matches = styleContent.match(pattern)
        if (matches) {
          matches.forEach(match => {
            const colorMatch = match.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)
            if (colorMatch) foundColors.push(colorMatch[0])
          })
        }
      })
    })

    // Get colors from header/nav backgrounds
    const header = $('header, nav, .header, .navbar').first()
    const headerBg = header.css('background-color')
    if (headerBg && headerBg !== 'transparent') {
      foundColors.push(headerBg)
    }

    // Use the most common colors found
    if (foundColors.length > 0) {
      colors.primary = foundColors[0]
      if (foundColors.length > 1) colors.secondary = foundColors[1]
      if (foundColors.length > 2) colors.accent = foundColors[2]
    }
  } catch (error) {
    console.error('Error extracting colors:', error)
  }

  return colors
}

// Extract restaurant name
function extractRestaurantName($: cheerio.CheerioAPI): string {
  // Try common patterns
  const titleText = $('title').first().text()
  const h1Text = $('h1').first().text()
  const logoText = $('.logo, .brand, .site-title').first().text()
  
  return titleText.split('|')[0].trim() || h1Text || logoText || 'Restaurant'
}

// Extract menu items with advanced pattern matching
function extractMenuItems($: cheerio.CheerioAPI): any[] {
  const menuItems: any[] = []
  
  // Method 1: Look for common menu element patterns
  const menuSelectors = [
    '.menu-item',
    '.menu_item',
    '.dish',
    '.food-item',
    '.product',
    '[class*="menu-item"]',
    '[class*="menu_item"]',
    '[class*="dish"]',
    '[class*="food"]',
    '[id*="menu"] li',
    '[class*="menu"] li',
    'article',
    '.item'
  ]

  menuSelectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const $elem = $(elem)
      const text = $elem.text().trim()
      
      // Skip if too short or too long
      if (text.length < 10 || text.length > 500) return
      
      const name = $elem.find('h1, h2, h3, h4, h5, strong, .name, .title, [class*="name"], [class*="title"]').first().text().trim()
      const description = $elem.find('p, .description, .desc, [class*="desc"], span').first().text().trim()
      
      // Look for price patterns: $X.XX or $X
      const priceMatch = text.match(/\$\s*(\d+(?:\.\d{2})?)/);
      const price = priceMatch ? priceMatch[1] : '0.00'
      
      if (name && name.length > 2 && name.length < 100) {
        menuItems.push({
          name,
          category: 'Main Course',
          description: description || text.substring(0, 200),
          price: price,
          available: true
        })
      }
    })
  })

  // Method 2: Text-based extraction - find patterns like "Item Name - $XX.XX - Description"
  const bodyText = $('body').text()
  const menuPattern = /([A-Z][A-Za-z\s&']{3,50})\s*[-–—]\s*\$(\d+(?:\.\d{2})?)\s*[-–—]?\s*([A-Za-z\s,]{10,200})/g
  
  let match
  while ((match = menuPattern.exec(bodyText)) !== null) {
    const [, name, price, description] = match
    if (name && !menuItems.find(item => item.name === name.trim())) {
      menuItems.push({
        name: name.trim(),
        category: 'Main Course',
        description: description.trim(),
        price: price,
        available: true
      })
    }
  }

  // Method 3: Look for structured data (JSON-LD)
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const json = JSON.parse($(elem).html() || '')
      if (json['@type'] === 'Restaurant' && json.hasMenu) {
        // Extract from structured data if available
        const menu = json.hasMenu?.hasMenuSection || []
        menu.forEach((section: any) => {
          section.hasMenuItem?.forEach((item: any) => {
            if (item.name) {
              menuItems.push({
                name: item.name,
                category: section.name || 'Main Course',
                description: item.description || '',
                price: item.offers?.price || '0.00',
                available: true
              })
            }
          })
        })
      }
    } catch (e) {
      // Skip invalid JSON
    }
  })

  // Remove duplicates based on name
  const uniqueItems = menuItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.name === item.name)
  )

  return uniqueItems.slice(0, 30) // Limit to 30 items
}

// Extract contact information
function extractContactInfo($: cheerio.CheerioAPI): { phone: string; email: string; address: string } {
  let phone = ''
  let email = ''
  let address = ''

  const bodyText = $('body').text()

  // Look for phone numbers - multiple patterns
  const phonePatterns = [
    /(\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/,
    /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
    /\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})/
  ]

  for (const pattern of phonePatterns) {
    const match = bodyText.match(pattern)
    if (match && !phone) {
      phone = match[0].trim()
      break
    }
  }

  // Also check href attributes
  $('a[href^="tel:"]').each((_, elem) => {
    if (!phone) {
      const href = $(elem).attr('href')
      if (href) {
        phone = href.replace('tel:', '').replace(/\D/g, '')
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      }
    }
  })

  // Look for email addresses
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
  $('a[href^="mailto:"]').each((_, elem) => {
    const href = $(elem).attr('href')
    if (href && !email) {
      email = href.replace('mailto:', '').split('?')[0]
    }
  })
  
  if (!email) {
    const emailMatch = bodyText.match(emailRegex)
    if (emailMatch) {
      email = emailMatch[0]
    }
  }

  // Look for address
  const addressSelectors = [
    '.address', 
    '[class*="address"]', 
    '[itemprop="address"]',
    '[class*="location"]'
  ]
  
  for (const selector of addressSelectors) {
    const addressText = $(selector).first().text().trim()
    if (addressText && addressText.length > 10 && addressText.length < 200) {
      address = addressText
      break
    }
  }

  // Try to find street address pattern in text
  if (!address) {
    const addressPattern = /(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\s+\d{5})/
    const match = bodyText.match(addressPattern)
    if (match) {
      address = match[0]
    }
  }

  return { phone, email, address }
}

// Extract business hours
function extractHours($: cheerio.CheerioAPI): string {
  // Look for common hours patterns in text
  const hoursSelectors = [
    '.hours', 
    '[class*="hours"]', 
    '[class*="Hours"]',
    '[class*="schedule"]',
    '[class*="time"]',
    '[id*="hours"]',
    '[id*="Hours"]'
  ]
  
  // First try specific selectors
  for (const selector of hoursSelectors) {
    const hoursText = $(selector).first().text().trim()
    if (hoursText && hoursText.length > 10 && hoursText.length < 300) {
      // Clean up the text - make it more readable
      let cleaned = hoursText
        .replace(/\s+/g, ' ')
        .replace(/Hours/gi, '')
        .replace(/BAR HOURS:/gi, '\nBar: ')
        .replace(/KITCHEN HOURS:/gi, '\nKitchen: ')
        .replace(/MON:|MONDAY:/gi, '\nMon: ')
        .replace(/TUE:|TUES:|TUESDAY:/gi, '\nTue: ')
        .replace(/WED:|WEDNESDAY:/gi, '\nWed: ')
        .replace(/THU:|THUR:|THURS:|THURSDAY:/gi, '\nThu: ')
        .replace(/FRI:|FRIDAY:/gi, '\nFri: ')
        .replace(/SAT:|SATURDAY:/gi, '\nSat: ')
        .replace(/SUN:|SUNDAY:/gi, '\nSun: ')
        .trim()
      return cleaned
    }
  }
  
  // Try to find hours in all text on the page
  const bodyText = $('body').text()
  
  // Look for common hour patterns like "Mon-Fri 10:00 AM - 5:00 PM" or "Sun – Wed 10:00 AM – 2:00 AM"
  const hourPatterns = [
    /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\s–-]+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*[\d:]+\s*[AP]M\s*[-–—]\s*[\d:]+\s*[AP]M/gi,
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\s–-]+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*[\d:]+\s*[AP]M\s*[-–—]\s*[\d:]+\s*[AP]M/gi
  ]
  
  for (const pattern of hourPatterns) {
    const matches = bodyText.match(pattern)
    if (matches && matches.length > 0) {
      // Return the first few matches joined
      return matches.slice(0, 3).join('\n').replace(/\s+/g, ' ').trim()
    }
  }
  
  return 'Please contact us for hours'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let websiteUrl: URL
    try {
      websiteUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    let html = ''
    
    // Try ScrapingBee first if API key is available
    const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY
    
    if (scrapingBeeApiKey) {
      try {
        console.log('Using ScrapingBee for enhanced scraping...')
        const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(websiteUrl.toString())}&render_js=true&premium_proxy=false&country_code=us`
        
        const response = await fetch(scrapingBeeUrl)
        
        if (response.ok) {
          html = await response.text()
          console.log('Successfully scraped with ScrapingBee')
        } else {
          console.log('ScrapingBee failed, falling back to basic scraping')
          throw new Error('ScrapingBee request failed')
        }
      } catch (error) {
        console.error('ScrapingBee error, falling back:', error)
        // Will fall through to Cheerio below
      }
    }
    
    // Fallback to basic scraping if ScrapingBee didn't work or isn't configured
    if (!html) {
      console.log('Using basic scraping (Cheerio)...')
      const https = require('https')
      const http = require('http')
      
      html = await new Promise<string>((resolve, reject) => {
        const protocol = websiteUrl.protocol === 'https:' ? https : http
        
        const req = protocol.get(websiteUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RestaurantAI-Bot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        }, (res: any) => {
          let data = ''
          
          res.on('data', (chunk: any) => {
            data += chunk
          })
          
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`Failed to fetch website: ${res.statusCode}`))
            } else {
              resolve(data)
            }
          })
        })
        
        req.on('error', (err: any) => {
          reject(err)
        })
        
        req.setTimeout(10000, () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
      })
    }
    const $ = cheerio.load(html)

    // Extract all data
    const restaurantName = extractRestaurantName($)
    const colors = extractColors(html, $)
    const contactInfo = extractContactInfo($)
    const hours = extractHours($)
    const menuItems = extractMenuItems($)

    // Extract description from meta tags or first paragraph
    const metaDescription = $('meta[name="description"]').attr('content') || ''
    const firstParagraph = $('p').first().text().trim()
    const description = metaDescription || firstParagraph || 'A wonderful restaurant experience'

    const scrapedData: ScrapedData = {
      restaurantName,
      description: description.substring(0, 500), // Limit length
      phone: contactInfo.phone,
      email: contactInfo.email,
      address: contactInfo.address,
      hours,
      colors,
      menuItems: menuItems.slice(0, 20), // Limit to first 20 items
      reviews: [], // Reviews are harder to scrape generically
      cuisine: 'American' // Default, user can change
    }

    // Log what was extracted for debugging
    console.log('Scraped data:', {
      restaurantName,
      hours,
      phone: contactInfo.phone,
      email: contactInfo.email,
      menuItemsCount: menuItems.length,
      menuSample: menuItems.slice(0, 2), // Show first 2 items
      colors
    })
    
    // Log if data is incomplete
    if (menuItems.length === 0) {
      console.log('⚠️  No menu items found - manual input will be required')
    }
    if (!contactInfo.phone) {
      console.log('⚠️  No phone number found')
    }
    if (hours === 'Please contact us for hours') {
      console.log('⚠️  No hours found - manual input will be required')
    }

    return NextResponse.json({ 
      success: true, 
      data: scrapedData,
      message: `Successfully extracted data from ${restaurantName}`
    })

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape website. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}

