// TEMPORARILY DISABLED - Apify import error
// import { NextRequest, NextResponse } from 'next/server'
// import { ApifyApi } from 'apify-client'

// Simple fallback export
export async function POST() {
  return Response.json({ error: 'Apify scraper temporarily disabled' }, { status: 503 })
}

/*
interface ApifyScrapedData {
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
  pages: Array<{
    url: string
    title: string
    content: string
    menuItems?: any[]
  }>
}

// Initialize Apify client - Temporarily disabled
// const apifyClient = new ApifyApi({
//   token: process.env.APIFY_TOKEN
// })

// Enhanced restaurant scraping with Apify
async function scrapeRestaurantWithApify(url: string): Promise<ApifyScrapedData> {
  console.log(`Starting Apify scraping for: ${url}`)
  
  try {
    // Use Apify's Website Content Crawler for comprehensive scraping
    const run = await apifyClient.actor('apify/website-content-crawler').call({
      startUrls: [{ url }],
      maxCrawlDepth: 3,
      maxCrawlPages: 50,
      onlyInsideDomain: true,
      removeElementsCssSelector: 'nav, footer, .ads, .social-media, .cookie-banner',
      pageFunction: `
        async function pageFunction(context) {
          const { page, request } = context
          
          // Wait for page to load completely
          await page.waitForLoadState('networkidle')
          
          // Extract basic page info
          const title = await page.title()
          const url = request.url
          
          // Extract menu items with enhanced selectors
          const menuItems = await page.$$eval('.menu-item, [class*="menu-item"], .dish, .food-item, .product, article, .item', items => {
            return items.map(item => {
              const name = item.querySelector('h1, h2, h3, h4, h5, strong, .name, .title, [class*="name"], [class*="title"]')?.textContent?.trim()
              const description = item.querySelector('p, .description, .desc, [class*="desc"], span')?.textContent?.trim()
              const priceMatch = item.textContent?.match(/\\$\\s*(\\d+(?:\\.\\d{2})?)/)
              const price = priceMatch ? priceMatch[1] : null
              
              if (name && name.length > 2) {
                return {
                  name,
                  description: description || '',
                  price: price || '0.00',
                  category: 'Main Course'
                }
              }
              return null
            }).filter(Boolean)
          })
          
          // Extract contact information
          const contactInfo = await page.evaluate(() => {
            const bodyText = document.body.textContent || ''
            
            // Phone patterns
            const phonePatterns = [
              /(\\+?1?\\s*\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4})/,
              /(\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4})/,
              /\\((\\d{3})\\)\\s*(\\d{3})[-.\\s]?(\\d{4})/
            ]
            
            let phone = ''
            for (const pattern of phonePatterns) {
              const match = bodyText.match(pattern)
              if (match) {
                phone = match[0].trim()
                break
              }
            }
            
            // Email
            const emailMatch = bodyText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/)
            const email = emailMatch ? emailMatch[0] : ''
            
            // Address
            const addressMatch = bodyText.match(/(\\d+\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,\\s*[A-Z]{2}\\s+\\d{5})/)
            const address = addressMatch ? addressMatch[0] : ''
            
            return { phone, email, address }
          })
          
          // Extract hours
          const hours = await page.evaluate(() => {
            const hoursSelectors = [
              '.hours', '[class*="hours"]', '[class*="Hours"]',
              '[class*="schedule"]', '[class*="time"]', '[id*="hours"]'
            ]
            
            for (const selector of hoursSelectors) {
              const element = document.querySelector(selector)
              if (element) {
                const text = element.textContent?.trim()
                if (text && text.length > 10 && text.length < 300) {
                  return text
                }
              }
            }
            
            const bodyText = document.body.textContent || ''
            const hourPatterns = [
              /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\\s–-]+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\\s*[\\d:]+\\s*[AP]M\\s*[-–—]\\s*[\\d:]+\\s*[AP]M/gi,
              /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\\s–-]+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\\s*[\\d:]+\\s*[AP]M\\s*[-–—]\\s*[\\d:]+\\s*[AP]M/gi
            ]
            
            for (const pattern of hourPatterns) {
              const matches = bodyText.match(pattern)
              if (matches && matches.length > 0) {
                return matches.slice(0, 3).join('\\n').replace(/\\s+/g, ' ').trim()
              }
            }
            
            return 'Please contact us for hours'
          })
          
          // Extract colors from CSS
          const colors = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets)
            const foundColors = []
            
            try {
              styleSheets.forEach(sheet => {
                try {
                  const rules = Array.from(sheet.cssRules || [])
                  rules.forEach(rule => {
                    if (rule.style) {
                      const bgColor = rule.style.backgroundColor
                      const textColor = rule.style.color
                      if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
                        foundColors.push(bgColor)
                      }
                      if (textColor && textColor !== 'transparent') {
                        foundColors.push(textColor)
                      }
                    }
                  })
                } catch (e) {
                  // Skip cross-origin stylesheets
                }
              })
            } catch (e) {
              // Fallback to inline styles
            }
            
            return {
              primary: foundColors[0] || '#4F46E5',
              secondary: foundColors[1] || '#6366F1',
              accent: foundColors[2] || '#818CF8'
            }
          })
          
          return {
            url,
            title,
            content: document.body.textContent || '',
            menuItems,
            contactInfo,
            hours,
            colors
          }
        }
      `
    })
    
    console.log(`Apify run started with ID: ${run.id}`)
    
    // Wait for the run to complete
    await apifyClient.run(run.id).waitForFinish()
    
    // Get the results
    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems()
    const results = dataset.items
    
    console.log(`Apify scraping completed. Found ${results.length} pages`)
    
    // Process and combine results
    const allMenuItems: any[] = []
    let restaurantName = 'Restaurant'
    let phone = ''
    let email = ''
    let address = ''
    let hours = 'Please contact us for hours'
    let colors = { primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8' }
    let description = ''
    
    // Process each page result
    results.forEach((result: any) => {
      if (result.title && !restaurantName.includes('Restaurant')) {
        restaurantName = result.title.split('|')[0].trim() || result.title
      }
      
      if (result.menuItems && Array.isArray(result.menuItems)) {
        allMenuItems.push(...result.menuItems)
      }
      
      if (result.contactInfo) {
        if (result.contactInfo.phone && !phone) phone = result.contactInfo.phone
        if (result.contactInfo.email && !email) email = result.contactInfo.email
        if (result.contactInfo.address && !address) address = result.contactInfo.address
      }
      
      if (result.hours && result.hours !== 'Please contact us for hours') {
        hours = result.hours
      }
      
      if (result.colors) {
        colors = result.colors
      }
      
      if (result.content && !description) {
        description = result.content.substring(0, 500)
      }
    })
    
    // Remove duplicate menu items
    const uniqueMenuItems = allMenuItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.name === item.name)
    )
    
    const scrapedData: ApifyScrapedData = {
      restaurantName,
      description: description.substring(0, 500),
      phone,
      email,
      address,
      hours,
      colors,
      menuItems: uniqueMenuItems.slice(0, 50),
      reviews: [],
      cuisine: 'American',
      pages: results.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content,
        menuItems: result.menuItems || []
      }))
    }
    
    console.log('Apify scraping results:', {
      restaurantName,
      pagesFound: results.length,
      menuItemsFound: uniqueMenuItems.length,
      phone,
      email,
      address,
      hours: hours !== 'Please contact us for hours' ? 'Found' : 'Not found'
    })
    
    return scrapedData
    
  } catch (error) {
    console.error('Apify scraping error:', error)
    throw new Error(`Apify scraping failed: ${error.message}`)
  }
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

    // Check if Apify token is configured
    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ 
        error: 'Apify token not configured. Please set APIFY_TOKEN environment variable.' 
      }, { status: 500 })
    }

    console.log(`Starting Apify scraping for: ${websiteUrl.toString()}`)
    
    // Scrape with Apify
    const scrapedData = await scrapeRestaurantWithApify(websiteUrl.toString())
    
    return NextResponse.json({ 
      success: true, 
      data: scrapedData,
      message: `Successfully scraped ${scrapedData.pages.length} pages from ${scrapedData.restaurantName} using Apify`
    })

  } catch (error) {
    console.error('Apify scraping error:', error)
    return NextResponse.json(
      { error: `Apify scraping failed: ${error.message}` },
      { status: 500 }
    )
  }
}
*/

