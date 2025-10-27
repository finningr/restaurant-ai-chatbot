'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Home, Save, Check } from 'lucide-react'
import Link from 'next/link'
import MenuReview from '@/app/components/MenuReview'

export default function ManualInputPage() {
  const searchParams = useSearchParams()
  const [brandColors, setBrandColors] = useState({
    primary: '#4F46E5',
    secondary: '#6366F1', 
    accent: '#818CF8'
  })
  const [formData, setFormData] = useState({
    restaurantName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    hours: '',
    menuItems: '',
    cuisine: 'American',
    priceRange: '$$'
  })
  const [structuredData, setStructuredData] = useState({
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
  const [isFormattingContact, setIsFormattingContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showMenuReview, setShowMenuReview] = useState(false)
  const [parsedMenuItems, setParsedMenuItems] = useState<any[]>([])
  const [isParsingMenu, setIsParsingMenu] = useState(false)

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

  // Load data from localStorage and fetch brand colors on component mount
  useEffect(() => {
    const url = searchParams.get('url')
    
    // Create a unique key for each restaurant URL
    const storageKey = url ? `restaurantData_${encodeURIComponent(url)}` : 'restaurantData'
    const storedData = localStorage.getItem(storageKey)
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setFormData(prev => ({
          ...prev,
          restaurantName: parsedData.name || '',
          description: parsedData.description || '',
          phone: parsedData.phone || '',
          email: parsedData.email || '',
          address: parsedData.address || '',
          hours: parsedData.hours || '',
          menuItems: parsedData.menu || '',
          cuisine: parsedData.cuisine || 'American',
          priceRange: parsedData.priceRange || '$$'
        }))
        
        if (parsedData.colors) {
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

    // Fetch brand colors from website scraping if URL is provided
    if (url) {
      fetchBrandColors(url)
    }
  }, [searchParams])

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

  const formatContactInfo = async () => {
    if (!formData.phone && !formData.email && !formData.address && !formData.hours) {
      return
    }

    setIsFormattingContact(true)
    try {
      const response = await fetch('/api/format-contact-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          hours: formData.hours
        })
      })

      if (response.ok) {
        const result = await response.json()
        setStructuredData(prev => ({
          ...prev,
          ...result.formatted
        }))
        console.log('Contact info formatted:', result.formatted)
      } else {
        console.error('Failed to format contact info')
      }
    } catch (error) {
      console.error('Error formatting contact info:', error)
    } finally {
      setIsFormattingContact(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsParsingMenu(true)

    try {
      // Parse menu text into structured data using AI
      let parsedMenuItems = []
      
      if (formData.menuItems.trim()) {
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

      // Show menu review interface
      setParsedMenuItems(parsedMenuItems)
      setShowMenuReview(true)
      setIsParsingMenu(false)

    } catch (error) {
      console.error('Error parsing menu:', error)
      setIsParsingMenu(false)
      alert('Error parsing menu. Please try again.')
    }
  }

  const handleMenuReviewApprove = async (approvedItems: any[]) => {
    setIsSubmitting(true)
    setShowMenuReview(false)

    try {
      // Create comprehensive restaurant data
      let addressData = structuredData.address
      
      // Fallback: if address is still a string, parse it automatically
      if (typeof addressData === 'string' || !addressData.street) {
        try {
          const addressResponse = await fetch('/api/format-contact-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: formData.address })
          })
          
          if (addressResponse.ok) {
            const result = await addressResponse.json()
            addressData = result.formatted.address || {
              street: formData.address,
              city: '',
              state: '',
              zip: '',
              country: 'USA'
            }
          }
        } catch (error) {
          console.error('Auto-address parsing failed:', error)
          addressData = {
            street: formData.address,
            city: '',
            state: '',
            zip: '',
            country: 'USA'
          }
        }
      }
      
      const restaurantData = {
        restaurantName: formData.restaurantName,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: addressData, // Use parsed address data
        hours: structuredData.hours, // Use structured hours object
        rawMenuText: formData.menuItems,
        menuItems: approvedItems,
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        websiteUrl: searchParams.get('url'), // Include website URL from demo page
        colors: brandColors,
        parsedMenuItems: approvedItems
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

      // Save to localStorage as fallback
      const restaurantDataForStorage = {
        name: formData.restaurantName,
        description: formData.description,
        phone: structuredData.phone || formData.phone,
        email: structuredData.email || formData.email,
        address: structuredData.address || formData.address,
        hours: structuredData.hours || formData.hours,
        menu: formData.menuItems,
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        colors: brandColors,
        parsedMenuItems: approvedItems
      }

      // Create a unique key for each restaurant URL
      const url = searchParams.get('url')
      const storageKey = url ? `restaurantData_${encodeURIComponent(url)}` : 'restaurantData'
      localStorage.setItem(storageKey, JSON.stringify(restaurantDataForStorage))
      console.log('Restaurant data saved to localStorage with key:', storageKey)

      setSubmitSuccess(true)
      setIsSubmitting(false)

      // Get the original URL from search params or use a default
      const originalUrl = searchParams.get('url') || 'https://www.vintagehimalayan.com/Home'
      
      // Navigate to preview with timestamp and URL
      window.location.replace(`/preview?timestamp=${Date.now()}&url=${encodeURIComponent(originalUrl)}`)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parsing Your Menu</h2>
          <p className="text-gray-600 mb-6">AI is analyzing your menu items...</p>
        </div>
      </div>
    )
  }

  if (showMenuReview) {
    return (
      <MenuReview
        menuItems={parsedMenuItems}
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
            <Link 
              href="/demo" 
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Demo</span>
            </Link>
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
          
          {/* Brand Colors Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Your chatbot will use these brand colors:</span>
              <div className="flex gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.primary }}
                  title={`Primary: ${brandColors.primary}`}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.secondary }}
                  title={`Secondary: ${brandColors.secondary}`}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: brandColors.accent }}
                  title={`Accent: ${brandColors.accent}`}
                ></div>
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
                  Email
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
                Restaurant Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Operating Hours
              </label>
              <textarea
                rows={3}
                value={formData.hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
            </div>

            {/* AI Formatting Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={formatContactInfo}
                disabled={isFormattingContact || (!formData.phone && !formData.email && !formData.address && !formData.hours)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isFormattingContact ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Formatting...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    AI Format Contact Info
                  </>
                )}
              </button>
            </div>

            {/* Structured Data Preview */}
            {(structuredData.phone || structuredData.email || structuredData.address || Object.keys(structuredData.hours).length > 0) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ AI Formatted Contact Info:</h4>
                {structuredData.phone && (
                  <p className="text-sm text-green-700"><strong>Phone:</strong> {structuredData.phone}</p>
                )}
                {structuredData.email && (
                  <p className="text-sm text-green-700"><strong>Email:</strong> {structuredData.email}</p>
                )}
                {structuredData.address && (
                  <div className="text-sm text-green-700">
                    <strong>Address:</strong>
                    {structuredData.address.street && <p>Street: {structuredData.address.street}</p>}
                    {structuredData.address.city && <p>City: {structuredData.address.city}</p>}
                    {structuredData.address.state && <p>State: {structuredData.address.state}</p>}
                    {structuredData.address.zip && <p>ZIP: {structuredData.address.zip}</p>}
                    {structuredData.address.country && <p>Country: {structuredData.address.country}</p>}
                  </div>
                )}
                {Object.keys(structuredData.hours).length > 0 && (
                  <div className="text-sm text-green-700">
                    <strong>Hours:</strong>
                    {Object.entries(structuredData.hours).map(([day, hours]) => (
                      <p key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}: {String(hours)}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

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
              <textarea
                required
                rows={6}
                value={formData.menuItems}
                onChange={(e) => handleInputChange('menuItems', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter each menu item on a new line. Include the price with a $ symbol (e.g., "Item Name - $12.99")
              </p>
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