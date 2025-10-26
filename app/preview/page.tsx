'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, User, Send, X, ChevronRight, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function PreviewPage() {
  const searchParams = useSearchParams()
  
  // Try to get data from localStorage first, fallback to URL params
  const [restaurantData, setRestaurantData] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get URL-specific data from localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const originalUrl = urlParams.get('url') || 'https://example.com'
      const urlKey = `restaurantData_${originalUrl}`
      console.log('Looking for localStorage key:', urlKey)
      const storedData = localStorage.getItem(urlKey)
      console.log('Stored data found:', storedData ? 'Yes' : 'No')
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          console.log('Parsed restaurant data:', parsedData)
          setRestaurantData(parsedData)
        } catch (e) {
          console.error('Failed to parse stored restaurant data:', e)
        }
      } else {
        console.log('No stored data found for key:', urlKey)
        // List all localStorage keys for debugging
        console.log('All localStorage keys:', Object.keys(localStorage))
      }
    }
  }, [])
  
  // Use stored data if available, otherwise fallback to URL params
  const websiteUrl = restaurantData?.url || searchParams.get('url')
  const restaurantName = restaurantData?.name || searchParams.get('name') || 'Restaurant'
  
  console.log('Preview page - websiteUrl:', websiteUrl)
  console.log('Preview page - restaurantData:', restaurantData)
  console.log('Preview page - searchParams.url:', searchParams.get('url'))
  const primaryColor = restaurantData?.primaryColor || searchParams.get('primaryColor') || '#4F46E5'
  const menuData = restaurantData?.menu || searchParams.get('menu') || searchParams.get('menuData') || '[]'
  // Handle structured contact information
  let hours = ''
  if (restaurantData?.hours) {
    if (typeof restaurantData.hours === 'object') {
      // Structured hours (JSONB format)
      const hoursObj = restaurantData.hours
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const hoursList = days.map(day => {
        const dayHours = hoursObj[day]
        if (dayHours) {
          return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours}`
        }
        return null
      }).filter(Boolean)
      hours = hoursList.join('\n')
    } else {
      // Legacy string format
      hours = restaurantData.hours
    }
  } else {
    hours = searchParams.get('hours') || ''
  }
  const manualMenu = restaurantData?.menu || searchParams.get('menu') || '' // Manual menu text
  const manualReviews = restaurantData?.reviews || searchParams.get('reviews') || '' // Manual reviews
  
  // Phone and email (formatted by AI)
  const phone = restaurantData?.phone || searchParams.get('phone') || ''
  const email = restaurantData?.email || searchParams.get('email') || ''
  
  // Address - handle both structured and legacy formats
  let address = ''
  if (restaurantData?.address) {
    if (typeof restaurantData.address === 'object') {
      // Structured address
      const addr = restaurantData.address
      const parts = []
      if (addr.street) parts.push(addr.street)
      if (addr.city) parts.push(addr.city)
      if (addr.state) parts.push(addr.state)
      if (addr.zip) parts.push(addr.zip)
      if (addr.country && addr.country !== 'USA') parts.push(addr.country)
      address = parts.join(', ')
    } else {
      // Legacy string format
      address = restaurantData.address
    }
  } else {
    address = searchParams.get('address') || ''
  }
  const description = restaurantData?.description || searchParams.get('description') || ''
  const cuisine = restaurantData?.cuisine || searchParams.get('cuisine') || ''
  const dietaryRestrictions = restaurantData?.dietaryRestrictions || searchParams.get('dietaryRestrictions') || ''
  const dietaryRestrictionsOther = restaurantData?.dietaryRestrictionsOther || searchParams.get('dietaryRestrictionsOther') || ''
  // Handle structured profitable dishes data
  let profitableDishes = ''
  if (restaurantData?.profitableDishes) {
    if (typeof restaurantData.profitableDishes === 'object' && restaurantData.profitableDishes.dish_names) {
      // Structured data from database
      profitableDishes = restaurantData.profitableDishes.dish_names.join(', ')
    } else if (typeof restaurantData.profitableDishes === 'string') {
      // Legacy string format
      profitableDishes = restaurantData.profitableDishes
    }
  } else {
    // Fallback to URL params
    profitableDishes = searchParams.get('profitableDishes') || ''
  }
  const upsellingStyle = restaurantData?.upsellingStyle || searchParams.get('upsellingStyle') || 'educational'
  const commonQuestions = restaurantData?.commonQuestions || searchParams.get('commonQuestions') || ''
  const specialServices = restaurantData?.specialServices || searchParams.get('specialServices') || ''
  const specialServicesOther = restaurantData?.specialServicesOther || searchParams.get('specialServicesOther') || ''
  const paymentMethods = restaurantData?.paymentMethods || searchParams.get('paymentMethods') || ''
  const paymentMethodsOther = restaurantData?.paymentMethodsOther || searchParams.get('paymentMethodsOther') || ''
  const busyTimes = restaurantData?.busyTimes || searchParams.get('busyTimes') || ''
  const busyTimesOther = restaurantData?.busyTimesOther || searchParams.get('busyTimesOther') || ''
  
  const [isOpen, setIsOpen] = useState(true)
  const [showBubble, setShowBubble] = useState(false)
  // Format restaurant name to show full state name
  const formatRestaurantName = (name: string) => {
    return name.replace(/, CO\b/g, ', Colorado')
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Welcome to ${formatRestaurantName(restaurantName)}! How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Force refresh when new data comes in (detected by timestamp parameter)
  useEffect(() => {
    const timestamp = searchParams.get('timestamp')
    if (timestamp) {
      // Reset messages to show fresh welcome message with updated restaurant name
      setMessages([
        {
          id: '1',
          text: `Welcome to ${formatRestaurantName(restaurantName)}! How can I help you today?`,
          isUser: false,
          timestamp: new Date()
        }
      ])
    }
  }, [searchParams, restaurantName])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Chat bubble preview timing (4 seconds)
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowBubble(true)
      }, 4000) // Show after 4 seconds
      
      return () => clearTimeout(timer)
    } else {
      setShowBubble(false)
    }
  }, [isOpen])

  // Function to render clickable contact information
  const renderClickableText = (text: string) => {
    // Check if text is undefined or null
    if (!text) {
      return ''
    }
    
    // Debug: Log the text to see what we're working with
    console.log('renderClickableText input:', JSON.stringify(text))
    
    // Phone number regex: (xxx) xxx-xxxx or xxx-xxx-xxxx or xxx.xxx.xxxx
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g
    // Email regex
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    // Address regex to detect street addresses
    const addressRegex = /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Way|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5})/g
    
    let result = text
      .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
      .replace(phoneRegex, (match) => {
        const cleanPhone = match.replace(/[^\d]/g, '')
        return `<a href="tel:${cleanPhone}" class="text-blue-600 underline hover:text-blue-800">${match}</a>`
      })
      .replace(emailRegex, (match) => {
        return `<a href="mailto:${match}" class="text-blue-600 underline hover:text-blue-800">${match}</a>`
      })
      .replace(addressRegex, (match) => {
        const encodedAddress = encodeURIComponent(match.trim())
        return `<a href="https://maps.google.com/?q=${encodedAddress}" target="_blank" class="text-blue-600 underline hover:text-blue-800">${match}</a>`
      })
    
    // Debug: Log the final result
    console.log('renderClickableText output:', JSON.stringify(result))
    
    return result
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isLoading) return

    // Handle special dietary question case
    if (textToSend === "dietary_question") {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: "Dietary",
        isUser: true,
        timestamp: new Date()
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "What dietary restrictions do you have?",
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage, aiMessage])
      setInput('')
      return
    }

    // Handle special menu overview case
    if (textToSend === "menu_overview") {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: "Menu",
        isUser: true,
        timestamp: new Date()
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Our menu features fresh ingredients and authentic flavors. We offer appetizers, main courses, salads, and beverages. Do you have any questions on specific dishes or do you need any recommendations?",
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage, aiMessage])
      setInput('')
      return
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Parse menu data
      let parsedMenuData = []
      try {
        parsedMenuData = JSON.parse(decodeURIComponent(menuData))
      } catch (e) {
        console.error('Failed to parse menu data:', e)
      }

      // Build context from scraped OR manual data
      let menuContext = ''
      if (manualMenu) {
        // Use manual menu text
        menuContext = `MENU:\n${manualMenu}`
      } else if (parsedMenuData.length > 0) {
        // Use scraped menu data
        menuContext = `MENU:\n${parsedMenuData.map((item: any) => 
          `${item.name} ($${item.price}) - ${item.description}${item.ingredients ? '. Ingredients: ' + item.ingredients : ''}`
        ).join('\n')}`
      }

      // Build dietary restrictions list
      let dietaryList = ''
      if (dietaryRestrictions) {
        const restrictions = dietaryRestrictions.split(',').filter((r: string) => r.trim())
        if (dietaryRestrictionsOther) {
          restrictions.push(dietaryRestrictionsOther)
        }
        dietaryList = restrictions.join(', ')
      }

      // Build special services list
      let servicesList = ''
      if (specialServices) {
        const services = specialServices.split(',').filter((s: string) => s.trim())
        if (specialServicesOther) {
          services.push(specialServicesOther)
        }
        servicesList = services.join(', ')
      }

      // Build payment methods list
      let paymentList = ''
      if (paymentMethods) {
        const methods = paymentMethods.split(',').filter((m: string) => m.trim())
        if (paymentMethodsOther) {
          methods.push(paymentMethodsOther)
        }
        paymentList = methods.join(', ')
      }

    const restaurantContext = `You are a friendly, knowledgeable staff member at ${restaurantName}. Talk like a real person - be warm, helpful, and conversational. Use natural language, not menu descriptions.

FUNDAMENTAL PRINCIPLE: Answer only the question asked. Do not repeat information from previous questions unless directly relevant to the current question.

CORE BEHAVIOR GUIDELINES:
- When asked about a specific dish, give a natural, conversational response about that dish only. Don't mention other dishes from previous questions.
- Don't include any disclaimer about dietary restrictions when simply describing dishes.
- Only use the dietary disclaimer when specifically asked about dietary restrictions, allergies, or dietary accommodations.
- Answer only the specific question asked. Don't repeat information from previous questions.
- Sound like a real person, not a robot reading a menu.
- Each question is independent - don't reference or repeat information from previous questions unless directly relevant.
- If asked about "saag lamb" or "sag lamb", look for "Saag Lamb" in the menu - it exists.
- Always be honest about what you know and don't know. If you don't have information, say so.
- When information is missing, provide helpful alternatives (e.g., "We don't use email for communication, but you can call us at [phone] or visit us at [address]").
- Each response should be completely independent and only address the specific question asked.
- Do not repeat information from previous questions unless directly relevant to the current question.

FORMATTING REQUIREMENTS:
- Always include the price when describing any dish (e.g., "The Veg Pakora ($6.99) is...")
- Always include all dietary information from the menu (e.g., if menu says "GF/DF" then say "gluten-free and dairy-free")
- Don't add dietary disclaimers when simply describing dishes
- Use the exact dietary abbreviations from the menu (GF, DF, etc.)
- If there's conflicting dietary info between title and description, use both - combine all dietary information mentioned anywhere

    RESTAURANT INFO:
    - Name: ${restaurantName}
    ${hours ? `- Hours: ${hours}` : ''}
    ${phone ? `- Phone: ${phone}` : ''}
    ${email ? `- Email: ${email}` : ''}
    ${address ? `- Address: ${address}` : ''}
    ${cuisine ? `- Cuisine: ${cuisine}` : ''}
    ${description ? `- Description: ${description}` : ''}
    ${busyTimes ? `- Busiest Times: ${busyTimes}${busyTimesOther ? `, ${busyTimesOther}` : ''}` : ''}

${menuContext}

${manualReviews ? `CUSTOMER REVIEWS:\n${manualReviews}` : ''}

SURVEY DATA (USE THIS AS YOUR FOUNDATION):
${dietaryList ? `- Dietary Restrictions Accommodated: ${dietaryList}` : ''}
${profitableDishes ? `- Popular Dishes to Recommend: ${profitableDishes}` : ''}
${upsellingStyle ? `- Upselling Style: ${upsellingStyle}` : ''}
${commonQuestions ? `- Common Customer Questions: ${commonQuestions}` : ''}
${servicesList ? `- Special Services Offered: ${servicesList}` : ''}
${paymentList ? `- Payment Methods Accepted: ${paymentList}` : ''}

            IMPORTANT INSTRUCTIONS:
            - When asked about menu items, use the exact descriptions from the menu above
            - When asked for verbatim/exact quotes, quote directly from the menu text provided
            - For prices, use the exact prices listed in the menu
            - When asked "what is the restaurant name" or "what's your name", respond with "The restaurant name is ${restaurantName}"
            - When asked "where are you located" or "what's your address", respond with "We are located at ${address || 'our restaurant location'}"
            - When asked "what are your hours" or "when are you open", respond with "Our hours are: ${hours || 'please call for current hours'}"
            - When asked "what's your phone number", respond with "You can reach us at ${phone || 'please check our website for contact information'}"
- For hours: When asked about hours, include all hour-related information available. If the hours data contains both business hours and carryout hours, format the response as:
  "Our hours are:
  - [business hours with bullet points]
  
  For carryout:
  - [carryout hours with bullet points]"
- For dietary accommodations: When asked "what dietary accommodations do you have" or similar, respond with exactly what is listed in "Dietary Restrictions Accommodated" above. Don't make up or guess dietary options.
- For dietary restrictions: When asked about a specific dietary restriction (like "nut allergies", "gluten-free", "dairy-free"), only recommend dishes that work for that specific restriction. Don't mix different dietary restrictions in the same response. Don't mention other dietary restrictions that were not asked about. If the user asks about "nut allergies", only mention nut-free dishes. If the user asks about "gluten-free", only mention gluten-free dishes. First recommend specific dishes that work for their needs, then end with exactly this text (including the line breaks): "\n\nPlease inform our staff about your dietary restrictions when ordering." Only use this disclaimer when specifically asked about dietary restrictions, allergies, or dietary accommodations. Don't include this disclaimer when simply describing dishes or answering general menu questions.
- CRITICAL DISCLAIMER RULE: The dietary disclaimer should ONLY appear when the user specifically asks about dietary restrictions, allergies, or dietary accommodations. It should NEVER appear when asked about unrelated topics like live music, events, hours, contact information, or general restaurant questions.
- When asked about a specific dish (like "tell me about the veg samosa"), only describe that dish. Don't mention other dishes from previous questions. Don't include any disclaimer about dietary restrictions.
- For upselling: Use the upselling style specified above (${upsellingStyle})
- For recommendations: When appropriate, recommend the dishes listed in "Popular Dishes to Recommend" - focus on taste and customer satisfaction
- When recommending dishes, suggest specific items by name (e.g., "Chicken Tandoori" or "Paneer Tikka Kebab") rather than just categories
- Never mention profitability, profit margins, or business benefits in recommendations
- Base all recommendations on taste, popularity, and customer satisfaction only
- Make recommendations sound natural and conversational, not like a formal list
- Use phrases like "I'd recommend trying..." or "You might enjoy..." instead of "I recommend the following popular dishes:"
- Keep recommendations warm and personal, like a friendly server would speak
- NEVER use bullet points (-) or numbered lists in recommendations
- Write recommendations as flowing sentences, not lists
- Example: "I'd recommend trying our Chicken Tandoori - it's perfectly spiced and grilled to perfection. You might also enjoy the Paneer Tikka Kebab if you're looking for something vegetarian."
- Avoid phrases like "the following dishes" or "these dishes are"
- Answer based only on the information provided above - don't make up information
- Don't mention any dishes that are not explicitly listed in the menu above
- If a dish is not in the menu, say "I don't see that item on our current menu" instead of making up information
- Only recommend dishes that are actually listed in the menu data provided
- Only answer the specific question asked. Don't mention other dishes unless specifically asked about them
- Don't repeat information from previous questions unless directly relevant
- Don't repeat the restaurant name in every response - only use it when necessary for clarity
- Be conversational and natural in your responses`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          restaurantContext: restaurantContext,
          menuData: parsedMenuData,
          conversationHistory: messages.slice(0, -1) // Exclude the current message
        }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I couldn\'t process that request.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!websiteUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Website URL Provided</h1>
          <p className="text-gray-600">Please provide a website URL to preview.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Live Preview - {restaurantName}</h1>
              <p className="text-sm text-primary-100">See how your AI chatbot looks with your brand colors!</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50"
              >
                Join Beta
              </Link>
              <Link
                href={`/manual-input?url=${encodeURIComponent(websiteUrl)}`}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Website Preview with Chatbot Overlay */}
      <div className="relative h-[calc(100vh-88px)] bg-gradient-to-br from-gray-100 to-gray-200">
        
        {/* Website Preview */}
        <div className="absolute inset-0">
          <iframe
            src={websiteUrl}
            className="w-full h-full border-0"
            title={`${restaurantName} Website Preview`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            loading="lazy"
          />
        </div>

        {/* Floating Chatbot Widget (EXACTLY like demo) */}
        {isOpen && (
          <div className="fixed bottom-4 right-4 z-50 w-[320px] h-[500px]">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
              {/* Header */}
              <div
                className="text-white p-4 rounded-t-lg flex items-center justify-between"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{restaurantName.split(' - ')[0]} Assistant</p>
                    <p className="text-xs text-white/70">Powered by RestaurantAI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto pl-3 pr-3 py-4 space-y-3 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser
                            ? 'text-white'
                            : 'bg-white text-primary-600'
                        }`}
                        style={message.isUser ? { backgroundColor: primaryColor } : { border: `2px solid ${primaryColor}`, color: primaryColor }}
                      >
                        {message.isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>
                      <div
                        className={`px-2 py-1 rounded-lg ${
                          message.isUser
                            ? 'text-white'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                        }`}
                        style={message.isUser ? { backgroundColor: primaryColor } : {}}
                      >
                        <p 
                          className="text-xs leading-tight whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: renderClickableText(message.text) }}
                        />
                        <p className="text-[10px] opacity-60 mt-0.5">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                        style={{ border: `2px solid ${primaryColor}`, color: primaryColor }}
                      >
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-white text-gray-800 px-2 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              <div className="border-t p-2 bg-white">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendMessage("What are your hours?")}
                    className="text-xs px-2.5 py-1 rounded-full hover:opacity-80 border"
                    style={{ 
                      backgroundColor: `${primaryColor}10`, 
                      color: primaryColor,
                      borderColor: `${primaryColor}40`
                    }}
                    disabled={isLoading}
                  >
                    Hours
                  </button>
                  <button
                    onClick={() => handleSendMessage("menu_overview")}
                    className="text-xs px-2.5 py-1 rounded-full hover:opacity-80 border"
                    style={{ 
                      backgroundColor: `${primaryColor}10`, 
                      color: primaryColor,
                      borderColor: `${primaryColor}40`
                    }}
                    disabled={isLoading}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => handleSendMessage("dietary_question")}
                    className="text-xs px-2.5 py-1 rounded-full hover:opacity-80 border"
                    style={{ 
                      backgroundColor: `${primaryColor}10`, 
                      color: primaryColor,
                      borderColor: `${primaryColor}40`
                    }}
                    disabled={isLoading}
                  >
                    Dietary
                  </button>
                  <button
                    onClick={() => handleSendMessage("What's your contact information?")}
                    className="text-xs px-2.5 py-1 rounded-full hover:opacity-80 border"
                    style={{ 
                      backgroundColor: `${primaryColor}10`, 
                      color: primaryColor,
                      borderColor: `${primaryColor}40`
                    }}
                    disabled={isLoading}
                  >
                    Contact
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                     style={{ '--tw-ring-color': primaryColor, color: '#111827' } as React.CSSProperties}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2.5 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button (when closed) */}
        {!isOpen && (
          <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
            {/* Chat Bubble Preview */}
            {showBubble && (
              <div className="relative mb-11">
                <div className="bg-white border-2 border-black shadow-lg p-3 max-w-xs animate-in slide-in-from-right-2 duration-300 relative">
                  <p className="text-black font-medium text-sm">Questions? Ask me!</p>
                  {/* Speech bubble notch - bottom right */}
                  <div className="absolute -bottom-2 -right-2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent transform rotate-45"></div>
                  <div className="absolute -bottom-1 -right-1 w-0 h-0 border-l-8 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent transform rotate-45"></div>
                </div>
              </div>
            )}
            
            {/* Chat Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="text-white p-3.5 rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="w-5.5 h-5.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
