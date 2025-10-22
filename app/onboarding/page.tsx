'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Globe, Loader2, Sparkles, Upload, FileText, ArrowRight, Home, Bot } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Step 1 data (from URL)
  const [brandData, setBrandData] = useState({
    restaurantName: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#6366F1'
  })
  
  // Step 2 data (comprehensive restaurant info)
  const [menuImage, setMenuImage] = useState<File | null>(null)
  const [hoursImage, setHoursImage] = useState<File | null>(null)
  const [menuText, setMenuText] = useState('')
  const [hours, setHours] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [extractedMenu, setExtractedMenu] = useState<any[]>([])
  const [isExtractingMenu, setIsExtractingMenu] = useState(false)
  const [isExtractingHours, setIsExtractingHours] = useState(false)
  const [scrapingProgress, setScrapingProgress] = useState('')
  const [scrapedFields, setScrapedFields] = useState<Set<string>>(new Set())

  // Auto-start extraction if coming from demo page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('url')
    const autoExtract = urlParams.get('autoExtract')
    const stepParam = urlParams.get('step')
    
    // Handle step parameter
    if (stepParam === '2') {
      setStep(2)
      
      // Pre-populate form data if coming from preview
      const name = urlParams.get('name')
      const primaryColor = urlParams.get('primaryColor')
      const hours = urlParams.get('hours')
      const menu = urlParams.get('menu')
      const phone = urlParams.get('phone')
      const email = urlParams.get('email')
      const address = urlParams.get('address')
      const description = urlParams.get('description')
      const cuisine = urlParams.get('cuisine')
      
      if (name) {
        setBrandData(prev => ({ ...prev, restaurantName: name }))
        setScrapedFields(prev => new Set([...prev, 'restaurantName']))
      }
      if (primaryColor) {
        setBrandData(prev => ({ ...prev, primaryColor }))
      }
      if (hours) {
        setHours(hours)
        setScrapedFields(prev => new Set([...prev, 'hours']))
      }
      if (menu) {
        setMenuText(menu)
        setScrapedFields(prev => new Set([...prev, 'menu']))
      }
      if (phone) {
        setPhone(phone)
        setScrapedFields(prev => new Set([...prev, 'phone']))
      }
      if (email) {
        setEmail(email)
        setScrapedFields(prev => new Set([...prev, 'email']))
      }
      if (address) {
        setAddress(address)
        setScrapedFields(prev => new Set([...prev, 'address']))
      }
      if (description) {
        setDescription(description)
        setScrapedFields(prev => new Set([...prev, 'description']))
      }
      if (cuisine) {
        setCuisine(cuisine)
        setScrapedFields(prev => new Set([...prev, 'cuisine']))
      }
    }
    
    if (url && autoExtract === 'true') {
      setWebsiteUrl(url)
      // Start extraction automatically after a brief delay
      setTimeout(() => {
        if (url.trim()) {
          setIsProcessing(true)
          setError('')
          setScrapingProgress('')

          // Show progress steps
          const progressSteps = [
            '🔍 Analyzing website...',
            '🎨 Extracting brand colors...',
            '📋 Looking through menu items...',
            '🕒 Gathering hours information...',
            '📍 Finding contact details...',
            '✨ Finalizing restaurant data...'
          ]

          let currentStep = 0
          const progressInterval = setInterval(() => {
            if (currentStep < progressSteps.length) {
              setScrapingProgress(progressSteps[currentStep])
              currentStep++
            }
          }, 800)

          // Call the extraction API
          fetch('/api/scrape-website', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
          })
          .then(response => response.json())
          .then(data => {
            clearInterval(progressInterval)
            setScrapingProgress('✅ Extraction complete!')

            if (data.data) {
              const newScrapedFields = new Set<string>()
              
              setBrandData({
                restaurantName: data.data.restaurantName || 'Your Restaurant',
                primaryColor: data.data.colors?.primary || '#4F46E5',
                secondaryColor: data.data.colors?.secondary || '#6366F1'
              })
              
              // Update all fields with scraped data
              if (data.data.restaurantName) {
                setBrandData(prev => ({ ...prev, restaurantName: data.data.restaurantName }))
                newScrapedFields.add('restaurantName')
              }
              
              if (data.data.phone) {
                setPhone(data.data.phone)
                newScrapedFields.add('phone')
              }
              
              if (data.data.hours && data.data.hours !== 'Please contact us for hours') {
                setHours(data.data.hours)
                newScrapedFields.add('hours')
              }
              
              if (data.data.email) {
                setEmail(data.data.email)
                newScrapedFields.add('email')
              }
              
              if (data.data.address) {
                setAddress(data.data.address)
                newScrapedFields.add('address')
              }
              
              if (data.data.description) {
                setDescription(data.data.description)
                newScrapedFields.add('description')
              }
              
              if (data.data.cuisine) {
                setCuisine(data.data.cuisine)
                newScrapedFields.add('cuisine')
              }
              
              setScrapedFields(newScrapedFields)
              
              // Move to step 2 after a brief delay
              setTimeout(() => {
                setStep(2)
              }, 1000)
            } else {
              setError('Could not extract branding. Please try again or skip.')
            }
          })
          .catch(error => {
            clearInterval(progressInterval)
            console.error('Branding extraction error:', error)
            setError('Failed to extract branding from website.')
          })
          .finally(() => {
            setIsProcessing(false)
            setTimeout(() => setScrapingProgress(''), 2000)
          })
        }
      }, 500)
    }
  }, [])

  // Step 1: Extract branding from URL
  const handleExtractBranding = async () => {
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(websiteUrl.trim())) {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setIsProcessing(true)
    setError('')
    setScrapingProgress('')

    // Show progress steps
    const progressSteps = [
      '🔍 Analyzing website...',
      '🎨 Extracting brand colors...',
      '📋 Looking through menu items...',
      '🕒 Gathering hours information...',
      '📍 Finding contact details...',
      '✨ Finalizing restaurant data...'
    ]

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setScrapingProgress(progressSteps[currentStep])
        currentStep++
      }
    }, 800)

    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setScrapingProgress('✅ Extraction complete!')

      if (data.data) {
        const newScrapedFields = new Set<string>()
        
        setBrandData({
          restaurantName: data.data.restaurantName || 'Your Restaurant',
          primaryColor: data.data.colors?.primary || '#4F46E5',
          secondaryColor: data.data.colors?.secondary || '#6366F1'
        })
        
        // Update all fields with scraped data
        if (data.data.restaurantName) {
          setBrandData(prev => ({ ...prev, restaurantName: data.data.restaurantName }))
          newScrapedFields.add('restaurantName')
        }
        
        if (data.data.phone) {
          setPhone(data.data.phone)
          newScrapedFields.add('phone')
        }
        
        if (data.data.hours && data.data.hours !== 'Please contact us for hours') {
          setHours(data.data.hours)
          newScrapedFields.add('hours')
        }
        
        if (data.data.email) {
          setEmail(data.data.email)
          newScrapedFields.add('email')
        }
        
        if (data.data.address) {
          setAddress(data.data.address)
          newScrapedFields.add('address')
        }
        
        if (data.data.description) {
          setDescription(data.data.description)
          newScrapedFields.add('description')
        }
        
        if (data.data.cuisine) {
          setCuisine(data.data.cuisine)
          newScrapedFields.add('cuisine')
        }
        
        setScrapedFields(newScrapedFields)
        
        // Move to step 2 after a brief delay
        setTimeout(() => {
          setStep(2)
        }, 1000)
      } else {
        setError('Could not extract branding. Please try again or skip.')
      }
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Branding extraction error:', error)
      setError('Failed to extract branding from website.')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setScrapingProgress(''), 2000)
    }
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  // Step 2: Process uploaded menu image with GPT-4 Vision
  const handleProcessMenuImage = async (file: File) => {
    setMenuImage(file)
    setIsExtractingMenu(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(',')[1]
        
        if (!base64Image) {
          setError('Failed to process image')
          setIsExtractingMenu(false)
          return
        }

        console.log('📤 Sending menu image to GPT-4 Vision...')

        const response = await fetch('/api/analyze-menu-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        })

        const data = await response.json()

        console.log('📥 API Response:', data)

        if (!response.ok || data.error) {
          console.error('❌ API Error:', data.error || data)
          setError(`Failed to extract menu: ${data.error || 'Unknown error'}. Please paste text instead.`)
          setIsExtractingMenu(false)
          return
        }

        if (data.menuItems && data.menuItems.length > 0) {
          console.log(`✅ Extracted ${data.menuItems.length} menu items!`)
          console.log('First item:', data.menuItems[0])
          setExtractedMenu(data.menuItems)
          setMenuText(data.menuItems.map((item: any) => 
            `${item.name} - $${item.price} - ${item.description}`
          ).join('\n'))
        } else {
          console.error('❌ No menu items found in response')
          setError('Could not extract menu items from image. Please paste text instead.')
        }

        setIsExtractingMenu(false)
      }

      reader.onerror = () => {
        setError('Failed to read image file')
        setIsExtractingMenu(false)
      }
    } catch (error) {
      console.error('Menu processing error:', error)
      setError('Failed to process menu image.')
      setIsExtractingMenu(false)
    }
  }

  // Process uploaded hours image with GPT-4 Vision
  const handleProcessHoursImage = async (file: File) => {
    setHoursImage(file)
    setIsExtractingHours(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(',')[1]
        
        if (!base64Image) {
          setError('Failed to process image')
          setIsExtractingHours(false)
          return
        }

        console.log('📤 Sending hours image to GPT-4 Vision...')

        const response = await fetch('/api/analyze-menu-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image: base64Image,
            extractHours: true
          }),
        })

        const data = await response.json()

        if (data.hours) {
          console.log(`✅ Extracted hours!`)
          setHours(data.hours)
        } else {
          setError('Could not extract hours from image. Please type them instead.')
        }

        setIsExtractingHours(false)
      }

      reader.onerror = () => {
        setError('Failed to read image file')
        setIsExtractingHours(false)
      }
    } catch (error) {
      console.error('Hours processing error:', error)
      setError('Failed to process hours image.')
      setIsExtractingHours(false)
    }
  }

  // Go to preview
  const handleCreatePreview = () => {
    // CRITICAL: Must have actual extracted/typed data, not just uploaded images
    const hasMenuData = menuText.trim().length > 0
    const hasHoursData = hours.trim().length > 0
    
    if (!brandData.restaurantName) {
      setError('Please provide Restaurant Name')
      return
    }
    
    if (!hasMenuData) {
      if (menuImage) {
        setError('Please wait for AI to finish extracting menu data, or paste the menu text manually')
      } else {
        setError('Please upload a menu image OR paste menu text')
      }
      return
    }
    
    if (!hasHoursData) {
      if (hoursImage) {
        setError('Please wait for AI to finish extracting hours, or type them manually')
      } else {
        setError('Please upload hours image OR type them manually')
      }
      return
    }

    console.log('Creating preview with menu:', menuText.substring(0, 100))

    const previewUrl = `/preview?url=${encodeURIComponent(websiteUrl)}&name=${encodeURIComponent(brandData.restaurantName)}&primaryColor=${encodeURIComponent(brandData.primaryColor)}&hours=${encodeURIComponent(hours)}&menu=${encodeURIComponent(menuText)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&address=${encodeURIComponent(address)}&description=${encodeURIComponent(description)}&cuisine=${encodeURIComponent(cuisine)}`
    window.location.href = previewUrl
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
              <div>
                <span className="text-2xl font-bold text-gray-900">RestaurantAI</span>
                <p className="text-xs text-gray-500">Step {step} of 2</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/login" className="text-gray-600 hover:text-primary-600">Login</a>
              <Link 
                href="/marketing"
                className="flex items-center text-gray-600 hover:text-primary-600"
              >
                <Home className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <a href="/signup" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Join Beta
              </a>
            </div>
            <Link 
              href="/marketing"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors md:hidden"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your AI Chatbot
            </h1>
            <p className="text-xl text-gray-600">
              Quick 2-step setup - Your personalized chatbot in 5 minutes
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium hidden sm:block">Website</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium hidden sm:block">Menu & Info</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Website URL */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Step 1: Your Website</h2>
                <p className="text-lg text-gray-600">
                  Enter your restaurant's website URL to extract your branding and colors
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleExtractBranding()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-lg"
                    placeholder="https://yourrestaurant.com"
                    disabled={isProcessing}
                    pattern="https?://.+"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a valid website URL (e.g., https://yourrestaurant.com) - We'll extract your brand colors to personalize the chatbot
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleExtractBranding}
                    disabled={isProcessing || !websiteUrl.trim()}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Extracting Restaurant Data...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Extract Restaurant Information</span>
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Indicator */}
                {scrapingProgress && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-blue-800 font-medium">{scrapingProgress}</span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={() => {
                      setBrandData({
                        restaurantName: '',
                        primaryColor: '#4F46E5',
                        secondaryColor: '#6366F1'
                      })
                      setStep(2)
                    }}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Skip - I'll enter everything manually →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Comprehensive Restaurant Information */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900">Step 2: Restaurant Information</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Complete your restaurant details for the AI chatbot
                </p>
                
                {/* Demo Disclaimer */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    <strong>Demo Note:</strong> Don't worry if some information isn't perfect. 
                    When you purchase the chatbot, our team will verify and correct all details for you.
                  </p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Restaurant Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                    {scrapedFields.has('restaurantName') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={brandData.restaurantName}
                    onChange={(e) => setBrandData({...brandData, restaurantName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="e.g., Pita Fresh Denver"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                    {scrapedFields.has('phone') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    {scrapedFields.has('email') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="info@yourrestaurant.com"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                    {scrapedFields.has('address') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                {/* Cuisine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Type
                    {scrapedFields.has('cuisine') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                  >
                    <option value="">Select cuisine type</option>
                    <option value="American">American</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Asian">Asian</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Indian">Indian</option>
                    <option value="Thai">Thai</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="French">French</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                    {scrapedFields.has('hours') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <textarea
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="Enter your restaurant hours"
                    rows={3}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Description
                    {scrapedFields.has('description') ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-filled</span>
                    ) : (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                    placeholder="Brief description of your restaurant..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Menu Section */}
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Menu Information
                  {extractedMenu.length === 0 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>
                  )}
                </h3>

                {/* Menu Upload or Text */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Upload Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📸 Upload Menu Image
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleProcessMenuImage(file)
                          }
                        }}
                        disabled={isProcessing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                      />
                      {isExtractingMenu && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs text-blue-700 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI reading menu... (estimated 30-60 seconds)
                          </p>
                        </div>
                      )}
                      {menuImage && !isExtractingMenu && menuText && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                          <p className="text-xs text-green-700">
                            ✅ {extractedMenu.length} items extracted!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Paste Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ✍️ Paste Menu Text
                      </label>
                      <textarea
                        value={menuText}
                        onChange={(e) => setMenuText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm"
                        placeholder="Falafel Pita - $8.99 - Fresh chickpea fritters&#10;Chicken Shawarma - $10.99 - Marinated chicken&#10;Lamb Gyro - $11.99 - Seasoned lamb"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Create Preview Button */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreatePreview}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Create My Chatbot Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}