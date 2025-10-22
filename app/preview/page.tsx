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
  const websiteUrl = searchParams.get('url')
  const restaurantName = searchParams.get('name') || 'Restaurant'
  const primaryColor = searchParams.get('primaryColor') || '#4F46E5'
  const menuData = searchParams.get('menuData') || '[]'
  const hours = searchParams.get('hours') || ''
  const manualMenu = searchParams.get('menu') || '' // Manual menu text
  const manualReviews = searchParams.get('reviews') || '' // Manual reviews
  const phone = searchParams.get('phone') || ''
  const email = searchParams.get('email') || ''
  const address = searchParams.get('address') || ''
  const description = searchParams.get('description') || ''
  const cuisine = searchParams.get('cuisine') || ''
  
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
    // Phone number regex: (xxx) xxx-xxxx or xxx-xxx-xxxx or xxx.xxx.xxxx
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g
    // Email regex
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    // Address regex to detect street addresses
    const addressRegex = /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Way|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5})/g
    
    let result = text
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

      const restaurantContext = `You are the AI assistant for ${restaurantName}. Keep responses SHORT and CONCISE (2-3 sentences max).

RESTAURANT INFO:
- Name: ${restaurantName}
- Hours: ${hours}
${phone ? `- Phone: ${phone}` : ''}
${email ? `- Email: ${email}` : ''}
${address ? `- Address: ${address}` : ''}
${cuisine ? `- Cuisine: ${cuisine}` : ''}
${description ? `- Description: ${description}` : ''}

${menuContext}

${manualReviews ? `CUSTOMER REVIEWS:\n${manualReviews}` : ''}

IMPORTANT INSTRUCTIONS:
- When asked about menu items, use the EXACT descriptions from the menu above
- When asked for verbatim/exact quotes, quote directly from the menu text provided
- For prices, use the exact prices listed in the menu
- For hours, use the exact hours provided above
- Be helpful about menu items, hours, and dietary questions
- Answer based ONLY on the information provided above - do not make up information
- Do NOT repeat the restaurant name in every response - only use it when necessary for clarity
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
                href={`/onboarding?step=2&url=${encodeURIComponent(websiteUrl || '')}&name=${encodeURIComponent(restaurantName)}&primaryColor=${encodeURIComponent(primaryColor)}&hours=${encodeURIComponent(hours)}&menu=${encodeURIComponent(manualMenu)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&address=${encodeURIComponent(address)}&description=${encodeURIComponent(description)}&cuisine=${encodeURIComponent(cuisine)}`}
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
        
        {/* Actual Website Preview */}
        <div className="absolute inset-0">
          <iframe
            src={websiteUrl}
            className="w-full h-full border-0"
            title={`${restaurantName} Website Preview`}
            sandbox="allow-same-origin allow-scripts"
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
