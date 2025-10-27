import { NextRequest, NextResponse } from 'next/server'

interface RestaurantData {
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

// Function to extract brand colors from website
async function extractBrandColors(url: string): Promise<{primary: string, secondary: string, accent: string}> {
  try {
    console.log('🎨 Extracting brand colors using ScrapingBee...')
    
    // Use ScrapingBee to get the website content
    const scrapingBeeUrl = 'https://app.scrapingbee.com/api/v1/'
    const params = new URLSearchParams({
      api_key: process.env.SCRAPINGBEE_API_KEY || '',
      url: url,
      render_js: 'true',
      premium_proxy: 'true',
      country_code: 'us'
    })
    
    const response = await fetch(`${scrapingBeeUrl}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`ScrapingBee failed: ${response.status}`)
    }
      
      const html = await response.text()
    console.log('✅ ScrapingBee response received, analyzing colors...')
    
    // Extract colors from CSS and HTML
    const colors = extractColorsFromHTML(html)
    
    if (colors.length === 0) {
      console.log('⚠️ No colors found, using defaults')
      return { primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8' }
    }
    
    // Select the best colors
    const selectedColors = selectBestColors(colors)
    console.log('🎨 Selected colors:', selectedColors)
    
    return selectedColors
      
    } catch (error) {
    console.error('❌ Color extraction failed:', error)
    return { primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8' }
  }
}

function extractColorsFromHTML(html: string): string[] {
  const colors: string[] = []
  
  // Focus on header/navigation brand colors first
  const brandColorPatterns = [
    // Header and navigation specific colors (HIGHEST PRIORITY)
    /(?:header|nav|navigation|navbar|menu-bar|top-bar)[^}]*background(?:-color)?:\s*([^;]+)/gi,
    /(?:header|nav|navigation|navbar|menu-bar|top-bar)[^}]*color:\s*([^;]+)/gi,
    // Logo and brand elements
    /(?:logo|brand|site-title)[^}]*background(?:-color)?:\s*([^;]+)/gi,
    /(?:logo|brand|site-title)[^}]*color:\s*([^;]+)/gi,
    // Primary buttons and CTAs
    /(?:btn-primary|button-primary|cta|call-to-action)[^}]*background(?:-color)?:\s*([^;]+)/gi,
    // CSS custom properties for brand colors
    /--(primary|brand|main|accent|secondary|color)[^:]*:\s*([^;]+)/gi,
    // Common brand color class names
    /\.(primary|brand|main|accent|secondary|color)[^}]*color:\s*([^;]+)/gi,
    // Header text colors
    /(?:h[1-6]|\.title|\.header)[^}]*color:\s*([^;]+)/gi
  ]
  
  // Extract colors using brand-focused patterns
  brandColorPatterns.forEach(pattern => {
    const matches = html.match(pattern)
        if (matches) {
          matches.forEach(match => {
        // Extract color values from the match
        const colorMatch = match.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/)
        if (colorMatch) {
          colors.push(colorMatch[0])
        }
      })
    }
  })
  
  // Also look for common brand color keywords in CSS
  const brandKeywords = [
    'primary', 'brand', 'main', 'accent', 'secondary', 'logo', 'header', 'title'
  ]
  
  brandKeywords.forEach(keyword => {
    const keywordPattern = new RegExp(`${keyword}[^}]*color:\\s*([^;]+)`, 'gi')
    const matches = html.match(keywordPattern)
    if (matches) {
      matches.forEach(match => {
        const colorMatch = match.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/)
        if (colorMatch) {
          colors.push(colorMatch[0])
        }
      })
    }
  })
  
  // Fallback: extract all colors but prioritize certain patterns
  const allHexMatches = html.match(/#[0-9a-fA-F]{3,6}/g)
  if (allHexMatches) {
    colors.push(...allHexMatches)
  }
  
  // Remove duplicates and filter out common non-brand colors
  const uniqueColors = Array.from(new Set(colors))
  const filteredColors = uniqueColors.filter(color => {
    const lowerColor = color.toLowerCase()
    // Filter out common non-brand colors
    return !lowerColor.includes('#ffffff') && 
           !lowerColor.includes('#000000') && 
           !lowerColor.includes('#f5f5f5') &&
           !lowerColor.includes('#e0e0e0') &&
           !lowerColor.includes('#cccccc') &&
           !lowerColor.includes('rgb(255, 255, 255)') &&
           !lowerColor.includes('rgb(0, 0, 0)') &&
           !lowerColor.includes('rgba(255, 255, 255') &&
           !lowerColor.includes('rgba(0, 0, 0')
  })
  
  console.log(`🔍 Found ${filteredColors.length} potential brand colors`)
  return filteredColors
}

function selectBestColors(colors: string[]): {primary: string, secondary: string, accent: string} {
  // Filter out invalid colors and sort by frequency
  const validColors = colors.filter(color => {
    // Check if it's a valid hex color
    if (color.startsWith('#')) {
      return /^#[0-9a-fA-F]{6}$/.test(color) || /^#[0-9a-fA-F]{3}$/.test(color)
    }
    // Check if it's a valid RGB/RGBA color
    if (color.startsWith('rgb')) {
      return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)
    }
    return false
  })
  
  const colorCounts = new Map<string, number>()
  validColors.forEach(color => {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
  })
  
  // Get the most frequent colors
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
  
  console.log('All colors found:', colors)
  console.log('Filtered colors:', validColors)
  
  // Smart color selection based on typical brand color patterns
  let primary = sortedColors[0] || '#4F46E5'
  let secondary = sortedColors[1] || '#6366F1'
  let accent = sortedColors[2] || '#818CF8'
  
  // Try to find better brand colors by looking for header-appropriate colors
  const brandColors = validColors.filter(color => {
    const hex = color.toLowerCase()
    // Look for colors that are good for headers/navigation (darker, more professional)
    if (hex.startsWith('#')) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      // Prefer darker colors for headers (20-180 range, avoiding very light colors)
      return brightness > 20 && brightness < 180
    }
    return true
  })
  
  if (brandColors.length > 0) {
    // Use the most frequent brand colors
    const brandColorCounts = new Map<string, number>()
    brandColors.forEach(color => {
      brandColorCounts.set(color, (brandColorCounts.get(color) || 0) + 1)
    })
    
    const sortedBrandColors = Array.from(brandColorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color)
    
    if (sortedBrandColors.length > 0) {
      primary = sortedBrandColors[0]
      secondary = sortedBrandColors[1] || primary
      accent = sortedBrandColors[2] || secondary
    }
  }
  
  return { primary, secondary, accent }
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

    console.log(`Manual input required for: ${websiteUrl.toString()}`)
    
    // Extract brand colors from the website
    console.log('Extracting brand colors...')
    const brandColors = await extractBrandColors(websiteUrl.toString())
    console.log('Extracted colors:', brandColors)
    
    // Return response indicating manual input is required with extracted colors
    return NextResponse.json({ 
      success: false,
      error: 'Manual input required',
      requiresManualInput: true,
      message: 'Please provide your restaurant information manually using the form below.',
      url: websiteUrl.toString(),
      brandColors: brandColors,
      suggestions: [
        'Use the manual input form to provide restaurant details',
        'Fill in all the required fields for the best chatbot experience',
        'Include menu items, contact info, and hours of operation',
        `We've extracted your website's brand colors to match your chatbot theme`
      ]
    }, { status: 200 })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ 
      success: false,
      error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      requiresManualInput: true,
      message: 'An error occurred. Please use the manual input form.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few minutes',
        'Use the manual input form as an alternative'
      ]
    }, { status: 500 })
  }
}