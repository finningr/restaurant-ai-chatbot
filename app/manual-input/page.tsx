'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Bot, Home, Save, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ColorPicker from '@/app/components/ColorPicker'

// Dynamically import MenuReview to avoid SSR issues
const MenuReview = dynamic(() => import('@/app/components/MenuReview'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading menu review...</p>
      </div>
    </div>
  )
})

export default function ManualInputPage() {
  const router = useRouter()
  const [brandColors, setBrandColors] = useState({
    primary: '#4F46E5',
    secondary: '#6366F1', 
    accent: '#818CF8'
  })
  const [formData, setFormData] = useState({
    websiteUrl: '',
    restaurantName: '',
    description: '',
    phone: '',
    email: '',
    ownerEmail: '',
    address: '',
    hours: '',
    hoursKitchen: '',
    hoursPickup: '',
    hoursHappyHour: '',
    hoursHoliday: '',
    hoursBrunch: '',
    hoursBar: '',
    menuItems: '',
    cuisine: 'American',
    cuisineOther: '',
    priceRange: '$$'
  })
  const [reservationLink, setReservationLink] = useState('')
  const [cateringLink, setCateringLink] = useState('')
  const [deliveryLinks, setDeliveryLinks] = useState<{
    website_order: string
    doordash: string
    uber_eats: string
    grubhub: string
    custom: Array<{ name: string; url: string }>
  }>({
    website_order: '',
    doordash: '',
    uber_eats: '',
    grubhub: '',
    custom: []
  })
  const [specialServices, setSpecialServices] = useState<string[]>([])
  const [structuredData, setStructuredData] = useState<{
    phone: string
    email: string
    address: string | { street?: string; city?: string; state?: string; zip?: string; country?: string }
    hours: string | Record<string, string> | { main?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string }
  }>({
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    hours: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showMenuReview, setShowMenuReview] = useState(false)
  const [parsedMenuItems, setParsedMenuItems] = useState<any[]>([])
  const [isParsingMenu, setIsParsingMenu] = useState(false)
  const [menuImages, setMenuImages] = useState<File[]>([])
  const [menuImagePreviews, setMenuImagePreviews] = useState<string[]>([])
  const [useImageUpload, setUseImageUpload] = useState(false)
  const [useMultipleMenus, setUseMultipleMenus] = useState(false)
  const [menuSections, setMenuSections] = useState<Array<{
    menuType: string
    menuTypeOther: string
    menuText: string
    menuImages: File[]
    menuImagePreviews: string[]
  }>>([{ menuType: '', menuTypeOther: '', menuText: '', menuImages: [], menuImagePreviews: [] }])

  const menuTypeOptions = [
    'Lunch',
    'Dinner',
    'Breakfast',
    'Brunch',
    'All Day',
    'Happy Hour',
    'Dessert',
    'Drinks',
    'Other'
  ]

  const cuisineOptions = [
    'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 
    'French', 'Indian', 'Thai', 'Chinese', 'Japanese', 'Korean',
    'Vietnamese', 'Middle Eastern', 'Latin American', 'Other'
  ]

  const priceRanges = [
    { value: '$', label: '$ - Inexpensive' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Very Expensive' }
  ]

  const specialServicesOptions = [
    'Takeout',
    'Delivery',
    'Delivery (in-house)',
    'Catering',
    'Reservations',
    'Outdoor seating',
    'Private events'
  ]

  // Auto-sync special services from links: reservation link → Reservations, catering link → Catering, 3rd party delivery (DoorDash/Uber Eats/Grubhub/custom) → Delivery
  useEffect(() => {
    setSpecialServices(prev => {
      let next = [...prev]
      const hasReservation = !!reservationLink?.trim()
      const hasCatering = !!cateringLink?.trim()
      const has3rdPartyDelivery = !!(deliveryLinks.doordash?.trim() || deliveryLinks.uber_eats?.trim() || deliveryLinks.grubhub?.trim() || deliveryLinks.custom?.some((c: any) => c?.url?.trim()))
      if (hasReservation && !next.includes('Reservations')) next = [...next, 'Reservations']
      if (!hasReservation && next.includes('Reservations')) next = next.filter(s => s !== 'Reservations')
      if (hasCatering && !next.includes('Catering')) next = [...next, 'Catering']
      if (!hasCatering && next.includes('Catering')) next = next.filter(s => s !== 'Catering')
      if (has3rdPartyDelivery && !next.includes('Delivery')) next = [...next, 'Delivery']
      if (!has3rdPartyDelivery && next.includes('Delivery')) next = next.filter(s => s !== 'Delivery')
      return next
    })
  }, [reservationLink, cateringLink, deliveryLinks.doordash, deliveryLinks.uber_eats, deliveryLinks.grubhub, deliveryLinks.custom])

  // Check if admin mode
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Load data from localStorage and fetch brand colors on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('url')
    const admin = urlParams.get('admin')
    setIsAdminMode(admin === 'true')
    
    // Load colors from URL params first (from sales rep dashboard scraping)
    const primaryColor = urlParams.get('primaryColor')
    const secondaryColor = urlParams.get('secondaryColor')
    const accentColor = urlParams.get('accentColor')
    
    if (primaryColor || secondaryColor || accentColor) {
      setBrandColors({
        primary: primaryColor || '#4F46E5',
        secondary: secondaryColor || '#6366F1',
        accent: accentColor || '#818CF8'
      })
    }
  
    // Create a unique key for each restaurant URL
    const storageKey = url ? `restaurantData_${encodeURIComponent(url)}` : 'restaurantData'
    const storedData = localStorage.getItem(storageKey)
    
    // Set websiteUrl from URL parameter if present
    if (url) {
      setFormData(prev => ({
        ...prev,
        websiteUrl: url
      }))
    }

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setFormData(prev => ({
          ...prev,
          websiteUrl: parsedData.websiteUrl || url || prev.websiteUrl,
          restaurantName: parsedData.name || '',
          description: parsedData.description || '',
          phone: parsedData.phone || '',
          email: parsedData.email || '',
          ownerEmail: parsedData.ownerEmail || '',
          address: parsedData.address || '',
          hours: typeof parsedData.hours === 'string' ? parsedData.hours : (parsedData.hoursMain || ''),
          hoursKitchen: parsedData.hoursKitchen || '',
          hoursPickup: parsedData.hoursPickup || '',
          hoursHappyHour: parsedData.hoursHappyHour || '',
          hoursHoliday: parsedData.hoursHoliday || '',
          hoursBrunch: parsedData.hoursBrunch || '',
          hoursBar: parsedData.hoursBar || '',
          menuItems: parsedData.menu || '',
          cuisine: parsedData.cuisine || 'American',
          cuisineOther: parsedData.cuisineOther || '',
          priceRange: parsedData.priceRange || '$$'
        }))
        if (parsedData.reservationLink) setReservationLink(parsedData.reservationLink)
        if (parsedData.cateringLink) setCateringLink(parsedData.cateringLink)
        if (parsedData.deliveryLinks) {
          setDeliveryLinks(prev => ({
            website_order: parsedData.deliveryLinks.website_order || prev.website_order,
            doordash: parsedData.deliveryLinks.doordash || prev.doordash,
            uber_eats: parsedData.deliveryLinks.uber_eats || prev.uber_eats,
            grubhub: parsedData.deliveryLinks.grubhub || prev.grubhub,
            custom: Array.isArray(parsedData.deliveryLinks.custom) ? parsedData.deliveryLinks.custom : prev.custom
          }))
        }
        if (Array.isArray(parsedData.specialServices)) {
          setSpecialServices(parsedData.specialServices)
        }
        
        // Only use localStorage colors if URL params didn't provide colors
        if (!primaryColor && !secondaryColor && !accentColor && parsedData.colors) {
          setBrandColors({
            primary: parsedData.colors.primary || '#4F46E5',
            secondary: parsedData.colors.secondary || '#6366F1',
            accent: parsedData.colors.accent || '#818CF8'
          })
        }
      } catch (e) {
        console.error('Failed to parse stored restaurant data:', e)
      }
    }

    // Fetch brand colors from website scraping if URL is provided and no colors from URL params
    if (url && !primaryColor && !secondaryColor && !accentColor) {
      fetchBrandColors(url)
    }
  }, [])

  const fetchBrandColors = async (websiteUrl: string) => {
    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.brandColors) {
          setBrandColors({
            primary: data.brandColors.primary || '#4F46E5',
            secondary: data.brandColors.secondary || '#6366F1',
            accent: data.brandColors.accent || '#818CF8'
          })
          console.log('Updated brand colors from website:', data.brandColors)
        }
      }
    } catch (error) {
      console.error('Failed to fetch brand colors:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate based on single or multiple menus mode
    if (useMultipleMenus) {
      // Validate multiple menu sections
      const hasValidSection = menuSections.some(section => {
        if (useImageUpload) {
          return section.menuImages.length > 0
        } else {
          return section.menuText.trim().length > 0
        }
      })
      if (!hasValidSection) {
        alert('Please add at least one menu section with content')
        return
      }
      // Check if all sections have menu types
      const missingTypes = menuSections.filter(s => {
        if (s.menuType === 'Other') {
          return !s.menuTypeOther.trim()
        }
        return !s.menuType.trim()
      })
      if (missingTypes.length > 0) {
        alert('Please specify a menu type for all menu sections')
        return
      }
    } else {
      // Validate single menu mode
      if (useImageUpload && menuImages.length === 0) {
        alert('Please upload at least one menu image or switch to text input')
        return
      }
      
      if (!useImageUpload && !formData.menuItems.trim()) {
        alert('Please enter menu items or upload images')
        return
      }
    }

    // Empty-field warnings - suggest adding missing info but allow continue
    const missing: string[] = []
    if (!formData.phone?.trim()) missing.push('Phone number')
    if (!formData.address?.trim()) missing.push('Address')
    if (!formData.hours?.trim()) missing.push('Operating hours')
    if (missing.length > 0) {
      const msg = `You're missing ${missing.join(', ')}. The chatbot won't be able to answer questions like "Where are you located?", "What are your hours?", or "What's your phone number?" without this info.\n\nContinue anyway?`
      if (!confirm(msg)) return
    }
    
    setIsParsingMenu(true)

    try {
      // First, format contact information automatically
      let formattedContactData = {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        hours: formData.hours
      }

      const hasAnyHours = formData.hours || formData.hoursKitchen || formData.hoursPickup || formData.hoursHappyHour || formData.hoursHoliday || formData.hoursBrunch || formData.hoursBar
      if (formData.phone || formData.email || formData.address || hasAnyHours) {
        try {
          const formatResponse = await fetch('/api/format-contact-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              hours: (formData.hours && !formData.hoursKitchen && !formData.hoursPickup && !formData.hoursHappyHour && !formData.hoursHoliday && !formData.hoursBrunch && !formData.hoursBar) ? formData.hours : undefined,
              hoursMain: (formData.hoursKitchen || formData.hoursPickup || formData.hoursHappyHour || formData.hoursHoliday || formData.hoursBrunch || formData.hoursBar) ? formData.hours : undefined,
              hoursKitchen: formData.hoursKitchen || undefined,
              hoursPickup: formData.hoursPickup || undefined,
              hoursHappyHour: formData.hoursHappyHour || undefined,
              hoursHoliday: formData.hoursHoliday || undefined,
              hoursBrunch: formData.hoursBrunch || undefined,
              hoursBar: formData.hoursBar || undefined
            })
          })

          if (formatResponse.ok) {
            const formatResult = await formatResponse.json()
            formattedContactData = formatResult.formatted || formattedContactData
            setStructuredData(prev => ({
              ...prev,
              phone: formattedContactData.phone || prev.phone,
              email: formattedContactData.email || prev.email,
              address: formattedContactData.address || (typeof prev.address === 'string' ? prev.address : prev.address),
              hours: formattedContactData.hours || prev.hours
            }))
            console.log('Contact info formatted:', formattedContactData)
          }
        } catch (formatError) {
          console.error('Contact formatting failed:', formatError)
          // Continue with original data if formatting fails
        }
      }

      // Then, parse menu items - either from image(s) or text
      let parsedMenuItems: any[] = []
      
      if (useMultipleMenus) {
        // Process multiple menu sections
        for (const section of menuSections) {
          if (useImageUpload && section.menuImages.length > 0) {
            // Extract menu items from uploaded images for this section
            try {
              const imageBase64Promises = section.menuImages.map((image) => {
                return new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = () => {
                    const result = reader.result as string
                    const base64 = result.split(',')[1]
                    resolve(base64)
                  }
                  reader.onerror = reject
                  reader.readAsDataURL(image)
                })
              })

              const imageBase64Array = await Promise.all(imageBase64Promises)

              const finalMenuType = section.menuType === 'Other' ? section.menuTypeOther : section.menuType
              const imageResponse = await fetch('/api/analyze-menu-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: imageBase64Array, menuType: finalMenuType })
              })

              if (imageResponse.ok) {
                const imageData = await imageResponse.json()
                const sectionItems = (imageData.menuItems || []).map((item: any) => ({
                  ...item,
                  menuType: finalMenuType
                }))
                parsedMenuItems = [...parsedMenuItems, ...sectionItems]
                console.log(`Extracted ${sectionItems.length} items for ${finalMenuType}:`, sectionItems)
              } else {
                // Try to parse error as JSON, but handle HTML/text responses
                let errorMessage = `Failed to analyze images for ${finalMenuType}`
                try {
                  const contentType = imageResponse.headers.get('content-type')
                  if (contentType && contentType.includes('application/json')) {
                    const errorData = await imageResponse.json()
                    errorMessage = errorData.error || errorMessage
                  } else {
                    const textResponse = await imageResponse.text()
                    // Try to extract error from HTML if it's an error page
                    if (textResponse.includes('Internal Server Error')) {
                      errorMessage = `Server error: Please check your OpenAI API key and try again`
                    } else {
                      errorMessage = `Server returned: ${textResponse.substring(0, 100)}`
                    }
                  }
                } catch (parseError) {
                  errorMessage = `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
                }
                throw new Error(errorMessage)
              }
            } catch (imageError) {
              const finalMenuType = section.menuType === 'Other' ? section.menuTypeOther : section.menuType
              console.error(`Image analysis failed for ${finalMenuType}:`, imageError)
              alert(`Failed to extract menu items from images for ${finalMenuType}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`)
              setIsParsingMenu(false)
              return
            }
          } else if (!useImageUpload && section.menuText.trim()) {
            // Parse menu items from text for this section
            try {
              const finalMenuType = section.menuType === 'Other' ? section.menuTypeOther : section.menuType
              const parseResponse = await fetch('/api/parse-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menuText: section.menuText, menuType: finalMenuType })
              })

              if (parseResponse.ok) {
                const parseData = await parseResponse.json()
                const sectionItems = (parseData.menuItems || []).map((item: any) => ({
                  ...item,
                  menuType: finalMenuType
                }))
                parsedMenuItems = [...parsedMenuItems, ...sectionItems]
                console.log(`Parsed ${sectionItems.length} items for ${finalMenuType}:`, sectionItems)
              } else {
                // Try to parse error as JSON, but handle HTML/text responses
                let errorMessage = `Failed to parse menu for ${finalMenuType}`
                try {
                  const contentType = parseResponse.headers.get('content-type')
                  if (contentType && contentType.includes('application/json')) {
                    const errorData = await parseResponse.json()
                    errorMessage = errorData.error || errorMessage
                  } else {
                    const textResponse = await parseResponse.text()
                    if (textResponse.includes('Internal Server Error')) {
                      errorMessage = `Server error: Please check your API configuration and try again`
                    } else {
                      errorMessage = `Server returned: ${textResponse.substring(0, 100)}`
                    }
                  }
                } catch (parseError) {
                  errorMessage = `HTTP ${parseResponse.status}: ${parseResponse.statusText}`
                }
                throw new Error(errorMessage)
              }
            } catch (parseError) {
              const finalMenuType = section.menuType === 'Other' ? section.menuTypeOther : section.menuType
              console.error(`Menu parsing failed for ${finalMenuType}:`, parseError)
              alert(`Failed to parse menu items for ${finalMenuType}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
              setIsParsingMenu(false)
              return
            }
          }
        }
      } else if (useImageUpload && menuImages.length > 0) {
        // Single menu mode - extract from images
        try {
          const imageBase64Promises = menuImages.map((image) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                const result = reader.result as string
                const base64 = result.split(',')[1]
                resolve(base64)
              }
              reader.onerror = reject
              reader.readAsDataURL(image)
            })
          })

          const imageBase64Array = await Promise.all(imageBase64Promises)

          const imageResponse = await fetch('/api/analyze-menu-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: imageBase64Array })
          })

          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            parsedMenuItems = imageData.menuItems || []
            console.log('Extracted menu items from images:', parsedMenuItems)
            
            if (imageData.menuText) {
              setFormData(prev => ({ ...prev, menuItems: imageData.menuText }))
            }
          } else {
            const errorData = await imageResponse.json()
            throw new Error(errorData.error || 'Failed to analyze images')
          }
        } catch (imageError) {
          console.error('Image analysis failed:', imageError)
          alert(`Failed to extract menu items from images: ${imageError instanceof Error ? imageError.message : 'Unknown error'}. Please try uploading the images again or use text input instead.`)
          setIsParsingMenu(false)
          return
        }
      } else if (formData.menuItems.trim()) {
        // Parse menu text into structured data using AI
        try {
          const parseResponse = await fetch('/api/parse-menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuText: formData.menuItems })
          })
          
          if (parseResponse.ok) {
            const parseData = await parseResponse.json()
            parsedMenuItems = parseData.menuItems || []
            console.log('Parsed menu items:', parsedMenuItems)
          }
        } catch (parseError) {
          console.error('Menu parsing failed:', parseError)
          // Fallback: create simple structure from raw text
          parsedMenuItems = formData.menuItems.split('\n').map((line, index) => ({
            name: line.trim(),
            price: null,
            category: 'Main Course',
            description: line.trim()
          }))
        }
      }

      // Show menu review interface with all restaurant info
      setParsedMenuItems(parsedMenuItems)
      setShowMenuReview(true)
      setIsParsingMenu(false)

    } catch (error) {
      console.error('Error processing form:', error)
      setIsParsingMenu(false)
      alert('Error processing your information. Please try again.')
    }
  }

  const handleMenuReviewApprove = async (approvedItems: any[], editedRestaurantInfo?: any) => {
    setIsSubmitting(true)
    setShowMenuReview(false)

    try {
      // Use edited restaurant info if provided, otherwise use form data
      const finalRestaurantInfo = editedRestaurantInfo || {
        name: formData.restaurantName,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: structuredData.address,
        hours: structuredData.hours,
        cuisine: formData.cuisine === 'Other' ? formData.cuisineOther : formData.cuisine,
        priceRange: formData.priceRange
      }
      
      // Create comprehensive restaurant data
      let addressData = finalRestaurantInfo.address
      
      // Fallback: if address is still a string, parse it automatically
      if (typeof addressData === 'string' || !addressData?.street) {
        try {
          const addressResponse = await fetch('/api/format-contact-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: typeof addressData === 'string' ? addressData : formData.address })
          })
          
          if (addressResponse.ok) {
            const result = await addressResponse.json()
            addressData = result.formatted.address || {
              street: typeof addressData === 'string' ? addressData : formData.address,
              city: '',
              state: '',
              zip: '',
              country: 'USA'
            }
          }
        } catch (error) {
          console.error('Auto-address parsing failed:', error)
          addressData = {
            street: typeof addressData === 'string' ? addressData : formData.address,
            city: '',
            state: '',
            zip: '',
            country: 'USA'
          }
        }
      }
      
      // Use brandColors from editedRestaurantInfo if available (from MenuReview), otherwise use state
      const finalBrandColors = editedRestaurantInfo?.brandColors || brandColors

      // Use deliveryLinks, reservationLink, specialServices from MenuReview edits if present, else from form state
      const srcLinks = editedRestaurantInfo?.deliveryLinks && typeof editedRestaurantInfo.deliveryLinks === 'object'
        ? editedRestaurantInfo.deliveryLinks
        : deliveryLinks
      const srcReservation = editedRestaurantInfo?.reservationLink != null ? editedRestaurantInfo.reservationLink : reservationLink
      const srcCatering = editedRestaurantInfo?.cateringLink != null ? editedRestaurantInfo.cateringLink : cateringLink
      const srcServices = (editedRestaurantInfo?.specialServices?.length ?? 0) > 0 ? editedRestaurantInfo!.specialServices! : specialServices

      const deliveryLinksPayload: Record<string, unknown> = {}
      const dl = srcLinks
      if (typeof dl === 'object') {
        if (typeof (dl as any).website_order === 'string' && (dl as any).website_order?.trim()) deliveryLinksPayload.website_order = (dl as any).website_order.trim()
        if (typeof (dl as any).doordash === 'string' && (dl as any).doordash?.trim()) deliveryLinksPayload.doordash = (dl as any).doordash.trim()
        if (typeof (dl as any).uber_eats === 'string' && (dl as any).uber_eats?.trim()) deliveryLinksPayload.uber_eats = (dl as any).uber_eats.trim()
        if (typeof (dl as any).grubhub === 'string' && (dl as any).grubhub?.trim()) deliveryLinksPayload.grubhub = (dl as any).grubhub.trim()
        const customArr = Array.isArray((dl as any).custom) ? (dl as any).custom : []
        const customWithUrls = customArr.filter((c: any) => c?.name?.trim() && c?.url?.trim())
        if (customWithUrls.length > 0) deliveryLinksPayload.custom = customWithUrls.map((c: any) => ({ name: c.name.trim(), url: c.url.trim() }))
      }

      const restaurantData = {
        restaurantName: finalRestaurantInfo.name || formData.restaurantName,
        description: finalRestaurantInfo.description || formData.description,
        phone: finalRestaurantInfo.phone || formData.phone,
        email: finalRestaurantInfo.email || formData.email,
        ownerEmail: finalRestaurantInfo.ownerEmail || formData.ownerEmail,
        address: addressData, // Use parsed address data
        hours: finalRestaurantInfo.hours || structuredData.hours, // Use structured hours object
        rawMenuText: formData.menuItems,
        menuItems: approvedItems,
        cuisine: finalRestaurantInfo.cuisine || (formData.cuisine === 'Other' ? formData.cuisineOther : formData.cuisine),
        priceRange: finalRestaurantInfo.priceRange || formData.priceRange,
        websiteUrl: formData.websiteUrl || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('url') : null), // Use form data first, then URL param as fallback
        colors: finalBrandColors,
        parsedMenuItems: approvedItems,
        deliveryLinks: Object.keys(deliveryLinksPayload).length > 0 ? deliveryLinksPayload : null,
        reservationLink: typeof srcReservation === 'string' ? srcReservation?.trim() || null : null,
        cateringLink: typeof srcCatering === 'string' ? srcCatering?.trim() || null : null,
        specialServices: Array.isArray(srcServices) && srcServices.length > 0 ? srcServices : null
      }

      // Save to database first
      try {
        const saveResponse = await fetch('/api/save-restaurant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restaurantData)
        })

        if (saveResponse.ok) {
          console.log('Restaurant data saved to database')
        } else {
          console.error('Failed to save to database, falling back to localStorage')
        }
      } catch (dbError) {
        console.error('Database save failed, using localStorage fallback:', dbError)
      }

      // Save to localStorage as fallback (use same url for storage key and preview redirect)
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const urlForStorage = formData.websiteUrl || urlParams?.get('url') || 'https://www.vintagehimalayan.com/Home'
      const storageKey = `restaurantData_${urlForStorage}`

      const restaurantDataForStorage = {
        name: formData.restaurantName,
        description: formData.description,
        phone: structuredData.phone || formData.phone,
        email: structuredData.email || formData.email,
        ownerEmail: formData.ownerEmail,
        address: structuredData.address || formData.address,
        hours: formData.hours,
        hoursMain: formData.hours,
        hoursKitchen: formData.hoursKitchen,
        hoursPickup: formData.hoursPickup,
        hoursHappyHour: formData.hoursHappyHour,
        hoursHoliday: formData.hoursHoliday,
        hoursBrunch: formData.hoursBrunch,
        hoursBar: formData.hoursBar,
        menu: formData.menuItems,
        cuisine: formData.cuisine,
        cuisineOther: formData.cuisineOther,
        priceRange: formData.priceRange,
        websiteUrl: formData.websiteUrl,
        colors: brandColors,
        parsedMenuItems: approvedItems,
        deliveryLinks: Object.keys(deliveryLinksPayload).length > 0 ? deliveryLinksPayload : null,
        reservationLink: restaurantData.reservationLink,
        cateringLink: restaurantData.cateringLink,
        specialServices: restaurantData.specialServices
      }

      localStorage.setItem(storageKey, JSON.stringify(restaurantDataForStorage))
      console.log('Restaurant data saved to localStorage with key:', storageKey)

      setSubmitSuccess(true)
      setIsSubmitting(false)

      const isSalesRepMode = urlParams?.get('sales_rep') === 'true'
      const isAdminMode = urlParams?.get('admin') === 'true'
      
      if (isSalesRepMode) {
        window.location.replace('/sales-dashboard')
      } else if (isAdminMode) {
        window.location.replace('/admin')
      } else {
        // Use same urlForStorage so preview finds the data
        window.location.replace(`/preview?timestamp=${Date.now()}&url=${encodeURIComponent(urlForStorage)}`)
      }
    } catch (error) {
      console.error('Error processing form:', error)
      setIsSubmitting(false)
    }
  }

  const handleMenuReviewCancel = () => {
    setShowMenuReview(false)
    setParsedMenuItems([])
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">Your restaurant chatbot has been created successfully.</p>
          <Link 
            href="/preview" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            View Your Chatbot
          </Link>
        </div>
      </div>
    )
  }

  if (isParsingMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuring Your Restaurant Information</h2>
          <p className="text-gray-600 mb-6">AI is formatting your contact information and analyzing your menu items...</p>
        </div>
      </div>
    )
  }

  if (showMenuReview) {
    // Determine final cuisine value
    const finalCuisine = formData.cuisine === 'Other' ? formData.cuisineOther : formData.cuisine
    
    return (
      <MenuReview
        menuItems={parsedMenuItems}
        restaurantInfo={{
          name: formData.restaurantName,
          description: formData.description,
          phone: structuredData.phone || formData.phone,
          email: structuredData.email || formData.email,
          ownerEmail: formData.ownerEmail,
          address: structuredData.address || formData.address,
          hours: structuredData.hours || formData.hours,
          cuisine: finalCuisine,
          priceRange: formData.priceRange,
          websiteUrl: formData.websiteUrl,
          brandColors: brandColors,
          deliveryLinks: (deliveryLinks.website_order?.trim() || deliveryLinks.doordash?.trim() || deliveryLinks.uber_eats?.trim() || deliveryLinks.grubhub?.trim() || deliveryLinks.custom?.some((c: any) => c?.name?.trim() && c?.url?.trim())) ? deliveryLinks : null,
          reservationLink: reservationLink?.trim() || null,
          cateringLink: cateringLink?.trim() || null,
          specialServices: specialServices.length > 0 ? specialServices : undefined
        }}
        onApprove={handleMenuReviewApprove}
        onCancel={handleMenuReviewCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">RestaurantAI</span>
            </div>
            {isAdminMode ? (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Back to Admin</span>
              </button>
            ) : (
              <Link 
                href="/demo" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Back to Demo</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant Information
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please provide your restaurant details to create your custom AI chatbot
          </p>
          
          {/* Brand Colors Picker */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPicker
                label="Primary Color"
                value={brandColors.primary}
                onChange={(color) => setBrandColors(prev => ({ ...prev, primary: color }))}
              />
              <ColorPicker
                label="Secondary Color"
                value={brandColors.secondary}
                onChange={(color) => setBrandColors(prev => ({ ...prev, secondary: color }))}
              />
              <ColorPicker
                label="Accent Color"
                value={brandColors.accent}
                onChange={(color) => setBrandColors(prev => ({ ...prev, accent: color }))}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-600">Preview:</span>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.primary }}
                  title={`Primary: ${brandColors.primary}`}
                />
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.secondary }}
                  title={`Secondary: ${brandColors.secondary}`}
                />
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.accent }}
                  title={`Accent: ${brandColors.accent}`}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* Basic Restaurant Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Basic Restaurant Information</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://www.example.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">The restaurant's website URL where the chatbot will be embedded</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Email
              </label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                placeholder="your-email@example.com (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - This email will be used to access the dashboard and analytics. Can be added later.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, Denver, CO 80202"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Use this format for best results: Street, City, State ZIP</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">Hours (paste from your website)</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main hours *</label>
                <textarea
                  rows={2}
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  placeholder="Mon–Fri: 11am–10pm, Sat–Sun: 10am–11pm"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Dine-in / general hours. You can paste everything here and we&apos;ll extract other types, or use the fields below.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kitchen hours (optional)</label>
                <input
                  type="text"
                  value={formData.hoursKitchen}
                  onChange={(e) => handleInputChange('hoursKitchen', e.target.value)}
                  placeholder="e.g. Kitchen closes 30 min before—Mon–Sun 9:30pm"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When the kitchen stops taking orders—often earlier than doors close. Leave blank if same as main hours.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup / takeout hours (optional)</label>
                <input
                  type="text"
                  value={formData.hoursPickup}
                  onChange={(e) => handleInputChange('hoursPickup', e.target.value)}
                  placeholder="e.g. Mon–Sun 11am–9:30pm"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if same as main hours</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Happy hour (optional)</label>
                <input
                  type="text"
                  value={formData.hoursHappyHour}
                  onChange={(e) => handleInputChange('hoursHappyHour', e.target.value)}
                  placeholder="e.g. Mon–Fri 3–6pm"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brunch hours (optional)</label>
                <input
                  type="text"
                  value={formData.hoursBrunch}
                  onChange={(e) => handleInputChange('hoursBrunch', e.target.value)}
                  placeholder="e.g. Sat–Sun 10am–2pm"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bar hours (optional)</label>
                <input
                  type="text"
                  value={formData.hoursBar}
                  onChange={(e) => handleInputChange('hoursBar', e.target.value)}
                  placeholder="e.g. Daily 4pm–2am"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When different from main dining hours</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Holiday hours (optional)</label>
                <textarea
                  rows={2}
                  value={formData.hoursHoliday}
                  onChange={(e) => handleInputChange('hoursHoliday', e.target.value)}
                  placeholder="e.g. Thanksgiving: Closed. Christmas Eve: 11am–5pm. New Year's Day: 11am–3pm."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Services
              </label>
              <p className="text-xs text-gray-500 mb-2">Check all that apply—helps the chatbot answer customer questions</p>
              <div className="flex flex-wrap gap-3">
                {specialServicesOptions.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialServices.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSpecialServices(prev => [...prev, option])
                        } else {
                          setSpecialServices(prev => prev.filter(s => s !== option))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reservation link
              </label>
              <input
                type="url"
                value={reservationLink}
                onChange={(e) => setReservationLink(e.target.value)}
                placeholder="https://opentable.com/... or Resy, etc."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Link to book a reservation (OpenTable, Resy, etc.)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catering link
              </label>
              <input
                type="url"
                value={cateringLink}
                onChange={(e) => setCateringLink(e.target.value)}
                placeholder="https://yoursite.com/catering"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">URL for catering inquiries (shown when Catering is in special services)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery / Online Ordering Links
              </label>
              <p className="text-xs text-gray-500 mb-3">Add links where customers can order. Leave blank if not applicable.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Order on our website</label>
                  <input
                    type="url"
                    value={deliveryLinks.website_order}
                    onChange={(e) => setDeliveryLinks(prev => ({ ...prev, website_order: e.target.value }))}
                    placeholder="https://yoursite.com/order or Toast/ChowNow link"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Direct link to order from your restaurant&apos;s site (Toast, ChowNow, etc.)</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">DoorDash</label>
                  <input
                    type="url"
                    value={deliveryLinks.doordash}
                    onChange={(e) => setDeliveryLinks(prev => ({ ...prev, doordash: e.target.value }))}
                    placeholder="https://www.doordash.com/store/..."
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Uber Eats</label>
                  <input
                    type="url"
                    value={deliveryLinks.uber_eats}
                    onChange={(e) => setDeliveryLinks(prev => ({ ...prev, uber_eats: e.target.value }))}
                    placeholder="https://www.ubereats.com/store/..."
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Grubhub</label>
                  <input
                    type="url"
                    value={deliveryLinks.grubhub}
                    onChange={(e) => setDeliveryLinks(prev => ({ ...prev, grubhub: e.target.value }))}
                    placeholder="https://www.grubhub.com/..."
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
                {deliveryLinks.custom.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Platform name (e.g. Toast, ChowNow)</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...deliveryLinks.custom]
                          updated[idx] = { ...updated[idx], name: e.target.value }
                          setDeliveryLinks(prev => ({ ...prev, custom: updated }))
                        }}
                        placeholder="e.g. Toast"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-gray-600 mb-1">URL</label>
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...deliveryLinks.custom]
                          updated[idx] = { ...updated[idx], url: e.target.value }
                          setDeliveryLinks(prev => ({ ...prev, custom: updated }))
                        }}
                        placeholder="https://..."
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeliveryLinks(prev => ({ ...prev, custom: prev.custom.filter((_, i) => i !== idx) }))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDeliveryLinks(prev => ({ ...prev, custom: [...prev.custom, { name: '', url: '' }] }))}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add other platform
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Menu & Food Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Menu & Food Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                >
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                {formData.cuisine === 'Other' && (
                  <input
                    type="text"
                    value={formData.cuisineOther}
                    onChange={(e) => handleInputChange('cuisineOther', e.target.value)}
                    placeholder="Enter cuisine type"
                    className="w-full mt-3 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={formData.priceRange}
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Menu Items with Prices *
              </label>
              <p className="text-xs text-gray-500 mb-2">Example format: <span className="font-mono text-gray-700">Chicken Tacos - $12 - Grilled chicken, salsa, lime. Burrito Bowl - $14 - Rice, beans, choice of protein.</span></p>
              
              {/* Toggle between text input and image upload */}
              <div className="mb-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setUseImageUpload(false)
                    setMenuImages([])
                    setMenuImagePreviews([])
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !useImageUpload
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Text Input
                </button>
                <button
                  type="button"
                  onClick={() => setUseImageUpload(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    useImageUpload
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload Image
                </button>
              </div>

              {/* Multiple Menus Checkbox */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="multiple-menus"
                  checked={useMultipleMenus}
                  onChange={(e) => {
                    setUseMultipleMenus(e.target.checked)
                    if (!e.target.checked) {
                      // Reset to single menu mode
                      setMenuSections([{ menuType: '', menuTypeOther: '', menuText: '', menuImages: [], menuImagePreviews: [] }])
                      setMenuImages([])
                      setMenuImagePreviews([])
                      setFormData(prev => ({ ...prev, menuItems: '' }))
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="multiple-menus" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Multiple Menus
                </label>
              </div>

              {useMultipleMenus ? (
                /* Multiple Menu Sections */
                <div className="space-y-6 mt-4">
                  {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 flex-wrap">
                          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                            Menu Type:
                          </label>
                          <select
                            value={section.menuType}
                            onChange={(e) => {
                              const updated = [...menuSections]
                              updated[sectionIndex].menuType = e.target.value
                              // Clear menuTypeOther if not "Other"
                              if (e.target.value !== 'Other') {
                                updated[sectionIndex].menuTypeOther = ''
                              }
                              setMenuSections(updated)
                            }}
                            className="flex-1 min-w-[200px] border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                          >
                            <option value="">Select menu type...</option>
                            {menuTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {section.menuType === 'Other' && (
                            <input
                              type="text"
                              value={section.menuTypeOther}
                              onChange={(e) => {
                                const updated = [...menuSections]
                                updated[sectionIndex].menuTypeOther = e.target.value
                                setMenuSections(updated)
                              }}
                              placeholder="Enter custom menu type..."
                              className="flex-1 min-w-[200px] border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                            />
                          )}
                        </div>
                        {menuSections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuSections(menuSections.filter((_, i) => i !== sectionIndex))
                            }}
                            className="ml-4 text-red-600 hover:text-red-800 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {useImageUpload ? (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                if (files.length > 0) {
                                  const updated = [...menuSections]
                                  updated[sectionIndex].menuImages = [...updated[sectionIndex].menuImages, ...files]
                                  setMenuSections(updated)
                                  // Create previews for new files
                                  files.forEach((file) => {
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const updated = [...menuSections]
                                      updated[sectionIndex].menuImagePreviews = [...updated[sectionIndex].menuImagePreviews, reader.result as string]
                                      setMenuSections(updated)
                                    }
                                    reader.readAsDataURL(file)
                                  })
                                }
                              }}
                              className="hidden"
                              id={`menu-image-upload-${sectionIndex}`}
                            />
                            <label
                              htmlFor={`menu-image-upload-${sectionIndex}`}
                              className="cursor-pointer flex flex-col items-center"
                            >
                              {section.menuImagePreviews.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                  {section.menuImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={preview}
                                        alt={`Menu preview ${index + 1}`}
                                        className="max-h-32 w-full object-cover rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const updated = [...menuSections]
                                          updated[sectionIndex].menuImages = updated[sectionIndex].menuImages.filter((_, i) => i !== index)
                                          updated[sectionIndex].menuImagePreviews = updated[sectionIndex].menuImagePreviews.filter((_, i) => i !== index)
                                          setMenuSections(updated)
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <>
                                  <svg
                                    className="w-12 h-12 text-gray-400 mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-gray-600 font-medium">
                                    Click to upload menu images
                                  </span>
                                  <span className="text-sm text-gray-500 mt-1">
                                    PNG, JPG, or JPEG up to 10MB each
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={section.menuText}
                          onChange={(e) => {
                            const updated = [...menuSections]
                            updated[sectionIndex].menuText = e.target.value
                            setMenuSections(updated)
                          }}
                          rows={6}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                          placeholder="Enter menu items for this menu type..."
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuSections([...menuSections, { menuType: '', menuTypeOther: '', menuText: '', menuImages: [], menuImagePreviews: [] }])
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">+</span>
                    <span className="font-medium">Add Another Menu</span>
                  </button>
                </div>
              ) : useImageUpload ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) {
                          setMenuImages(prev => [...prev, ...files])
                          // Create previews for new files
                          files.forEach((file) => {
                            const reader = new FileReader()
                            reader.onload = () => {
                              setMenuImagePreviews(prev => [...prev, reader.result as string])
                            }
                            reader.readAsDataURL(file)
                          })
                        }
                      }}
                      className="hidden"
                      id="menu-image-upload"
                      required={useImageUpload && menuImages.length === 0}
                    />
                    <label
                      htmlFor="menu-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {menuImagePreviews.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                          {menuImagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Menu preview ${index + 1}`}
                                className="max-h-32 w-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuImages(prev => prev.filter((_, i) => i !== index))
                                  setMenuImagePreviews(prev => prev.filter((_, i) => i !== index))
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-gray-600 font-medium">
                            Click to upload menu images
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            PNG, JPG, or JPEG up to 10MB each (you can select multiple)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {menuImages.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">
                        {menuImages.length} image{menuImages.length > 1 ? 's' : ''} selected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {menuImages.map((image, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {image.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    required={!useImageUpload}
                    rows={6}
                    value={formData.menuItems}
                    onChange={(e) => handleInputChange('menuItems', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter each menu item on a new line. Include the price with a $ symbol (e.g., "Item Name - $12.99")
                  </p>
                </>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Creating Your Chatbot...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Create My Chatbot
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}