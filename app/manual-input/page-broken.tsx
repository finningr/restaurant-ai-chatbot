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
    priceRange: '$$',
    profitableDishes: '',
    upsellingStyle: 'educational',
    dietaryRestrictions: '',
    dietaryRestrictionsOther: '',
    specialServices: '',
    specialServicesOther: '',
    paymentMethods: '',
    paymentMethodsOther: '',
    dressCode: ''
  })
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

  const upsellingOptions = [
    { value: 'subtle', label: 'Subtle suggestions ("Many customers also enjoy...")' },
    { value: 'direct', label: 'Direct recommendations ("I highly recommend...")' },
    { value: 'educational', label: 'Educational approach ("This pairs perfectly with...") - Recommended' },
    { value: 'combination', label: 'Combination approach (Mix of all three)' }
  ]


  const specialServicesOptions = [
    'Takeout',
    'Delivery',
    'Catering',
    'Private events',
    'Reservations',
    'Outdoor seating',
    'Live Music',
    'Other'
  ]

  const busyTimesOptions = [
    'Breakfast (8-10am)',
    'Lunch rush (11am-2pm)',
    'Dinner rush (6pm-9pm)',
    'Late night (9pm-close)',
    'Other'
  ]

  // Read from localStorage first, then URL parameters for brand colors and form data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to get data from localStorage first (URL-specific)
      const urlParams = new URLSearchParams(window.location.search)
      const originalUrl = urlParams.get('url') || 'https://example.com'
      const urlKey = `restaurantData_${originalUrl}`
      console.log('Looking for data with key:', urlKey)
      const storedData = localStorage.getItem(urlKey)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          console.log('Loaded data from localStorage:', parsedData)
          
          // Set brand colors from stored data
          if (parsedData.primaryColor || parsedData.secondaryColor || parsedData.accentColor) {
            setBrandColors({
              primary: parsedData.primaryColor || '#4F46E5',
              secondary: parsedData.secondaryColor || '#6366F1',
              accent: parsedData.accentColor || '#818CF8'
            })
          }

          // Populate form data from stored data
          setFormData(prev => ({
            ...prev,
            restaurantName: parsedData.name || '',
            hours: parsedData.hours || '',
            kitchenHours: parsedData.kitchenHours || '',
            happyHour: parsedData.happyHour || '',
            busyTimes: parsedData.busyTimes || '',
            busyTimesOther: parsedData.busyTimesOther || '',
            phone: parsedData.phone || '',
            email: parsedData.email || '',
            address: parsedData.address || '',
            description: parsedData.description || '',
            cuisine: parsedData.cuisine || 'American',
            priceRange: parsedData.priceRange || '$$',
            profitableDishes: parsedData.profitableDishes || '',
            upsellingStyle: parsedData.upsellingStyle || 'educational',
            dietaryRestrictions: parsedData.dietaryRestrictions || '',
            dietaryRestrictionsOther: parsedData.dietaryRestrictionsOther || '',
            specialServices: parsedData.specialServices || '',
            specialServicesOther: parsedData.specialServicesOther || '',
            paymentMethods: parsedData.paymentMethods || '',
            paymentMethodsOther: parsedData.paymentMethodsOther || '',
            menuItems: parsedData.menu || '',
            dressCode: parsedData.dressCode || ''
          }))
          console.log('Form data populated from localStorage')
          return // Exit early if we found stored data
        } catch (e) {
          console.error('Failed to parse stored restaurant data:', e)
        }
      }

      // Fallback to URL parameters (reuse existing urlParams)
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

      // Populate form data from URL parameters
      const name = urlParams.get('name')
      const hours = urlParams.get('hours')
      const phone = urlParams.get('phone')
      const email = urlParams.get('email')
      const address = urlParams.get('address')
      const description = urlParams.get('description')
      const cuisine = urlParams.get('cuisine')
      const menu = urlParams.get('menu')
      if (name || hours || phone || email || address || description || cuisine || menu) {
        setFormData(prev => ({
          ...prev,
          restaurantName: name || prev.restaurantName,
          hours: hours || prev.hours,
          phone: phone || prev.phone,
          email: email || prev.email,
          address: address || prev.address,
          description: description || prev.description,
          cuisine: cuisine || prev.cuisine,
          menuItems: menu || prev.menuItems,
        }))
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started', { formData, brandColors })
    
    // Validate required fields
    if (!formData.restaurantName.trim()) {
      alert('Please enter a restaurant name')
      return
    }
    if (!formData.description.trim()) {
      alert('Please enter a description')
      return
    }
    if (!formData.menuItems.trim()) {
      alert('Please enter menu items')
      return
    }
    
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
      const restaurantData = {
        restaurantName: formData.restaurantName,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        hours: formData.hours,
        colors: brandColors,
        menuItems: approvedItems.slice(0, 30),
        rawMenuText: formData.menuItems, // Keep original text as backup
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
        profitableDishes: formData.profitableDishes,
        upsellingStyle: formData.upsellingStyle,
        dietaryRestrictions: formData.dietaryRestrictions,
        dietaryRestrictionsOther: formData.dietaryRestrictionsOther,
        specialServices: formData.specialServices,
        specialServicesOther: formData.specialServicesOther,
        paymentMethods: formData.paymentMethods,
        paymentMethodsOther: formData.paymentMethodsOther,
        dressCode: formData.dressCode
      }

      // Get the original website URL from the page URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const originalUrl = urlParams.get('url') || 'https://example.com'
      
      // Store data in localStorage to avoid URL length limits
      const restaurantDataForStorage = {
        url: originalUrl,
        name: restaurantData.restaurantName,
        primaryColor: restaurantData.colors.primary,
        secondaryColor: restaurantData.colors.secondary,
        accentColor: restaurantData.colors.accent,
        hours: restaurantData.hours,
        menu: formData.menuItems,
        phone: restaurantData.phone,
        email: restaurantData.email,
        address: restaurantData.address,
        description: restaurantData.description,
        cuisine: restaurantData.cuisine,
        priceRange: restaurantData.priceRange,
        profitableDishes: restaurantData.profitableDishes,
        upsellingStyle: restaurantData.upsellingStyle,
        dietaryRestrictions: restaurantData.dietaryRestrictions,
        dietaryRestrictionsOther: restaurantData.dietaryRestrictionsOther,
        specialServices: restaurantData.specialServices,
        specialServicesOther: restaurantData.specialServicesOther,
        paymentMethods: restaurantData.paymentMethods,
        paymentMethodsOther: restaurantData.paymentMethodsOther,
        dressCode: restaurantData.dressCode,
        timestamp: Date.now().toString()
      }

      // Save to Supabase database
      try {
        const saveResponse = await fetch('/api/save-restaurant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...restaurantDataForStorage,
            websiteUrl: originalUrl,
            widgetId: `restaurant-${Date.now()}`
          })
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          console.log('Restaurant saved to database:', saveData)
          
          // Also save to localStorage as backup
          const urlKey = `restaurantData_${originalUrl}`
          localStorage.setItem(urlKey, JSON.stringify(restaurantDataForStorage))
          
          alert(`Restaurant data saved successfully! Widget ID: ${saveData.widgetId}`)
        } else {
          throw new Error('Failed to save to database')
        }
      } catch (dbError) {
        console.error('Database save failed:', dbError)
        
        // Fallback: save to localStorage only
        const urlKey = `restaurantData_${originalUrl}`
        localStorage.setItem(urlKey, JSON.stringify(restaurantDataForStorage))
        console.log('Restaurant data saved to localStorage (database failed)')
        alert('Restaurant data saved to local storage (database connection failed)')
      }
      
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">Your restaurant information has been processed.</p>
          <Link 
            href="/preview"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            View Your Chatbot
          </Link>
        </div>
      </div>
    )
  }

  // Show menu review interface if parsing is complete
  if (showMenuReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <MenuReview
          menuItems={parsedMenuItems}
          onApprove={handleMenuReviewApprove}
          onCancel={handleMenuReviewCancel}
        />
      </div>
    )
  }

  // Show loading state while parsing menu
  if (isParsingMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parsing Your Menu</h2>
          <p className="text-gray-600 mb-6">AI is analyzing your menu items...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
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
          
          {/* Brand Colors Preview for Chatbot */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2">
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
          {/* Section 1: Basic Restaurant Information */}
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
          </div>

          {/* Section 2: Operating Hours & Schedule */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Operating Hours & Schedule</h2>
            
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

          </div>

          {/* Section 3: Menu & Food Information */}
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Most Profitable Dishes to Recommend
              </label>
              <textarea
                rows={3}
                value={formData.profitableDishes}
                onChange={(e) => handleInputChange('profitableDishes', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                List dishes you want the chatbot to actively suggest to increase revenue
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upselling Style
              </label>
              <select
                value={formData.upsellingStyle}
                onChange={(e) => handleInputChange('upsellingStyle', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
              >
                {upsellingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Restrictions Accommodated (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Vegetarian', 'Vegan', 'Gluten-free', 'Nut-free', 'Dairy-free', 'Other'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.dietaryRestrictions.includes(option)}
                      onChange={(e) => {
                        const currentRestrictions = formData.dietaryRestrictions.split(',').filter(r => r.trim())
                        if (e.target.checked) {
                          handleInputChange('dietaryRestrictions', [...currentRestrictions, option].join(','))
                        } else {
                          handleInputChange('dietaryRestrictions', currentRestrictions.filter(r => r !== option).join(','))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {formData.dietaryRestrictions.includes('Other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.dietaryRestrictionsOther}
                    onChange={(e) => handleInputChange('dietaryRestrictionsOther', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Services Offered (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialServicesOptions.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.specialServices.includes(option)}
                      onChange={(e) => {
                        const currentServices = formData.specialServices.split(',').filter(s => s.trim())
                        if (e.target.checked) {
                          handleInputChange('specialServices', [...currentServices, option].join(','))
                        } else {
                          handleInputChange('specialServices', currentServices.filter(s => s !== option).join(','))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {formData.specialServices.includes('Other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.specialServicesOther}
                    onChange={(e) => handleInputChange('specialServicesOther', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Methods Accepted (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Cash', 'Credit cards', 'Debit cards', 'Mobile Payments (Apple Pay, Google Pay)', 'Other'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.paymentMethods.includes(option)}
                      onChange={(e) => {
                        const currentMethods = formData.paymentMethods.split(',').filter(m => m.trim())
                        if (e.target.checked) {
                          handleInputChange('paymentMethods', [...currentMethods, option].join(','))
                        } else {
                          handleInputChange('paymentMethods', currentMethods.filter(m => m !== option).join(','))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {formData.paymentMethods.includes('Other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.paymentMethodsOther}
                    onChange={(e) => handleInputChange('paymentMethodsOther', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Brand & Personality */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Brand & Personality</h2>
            
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