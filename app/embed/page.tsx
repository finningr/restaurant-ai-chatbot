'use client'

import { useEffect, useState } from 'react'
import { Bot, User, Send, X } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface RestaurantData {
  id: string
  name: string
  description: string
  phone: string
  email: string
  address: any
  hours: any
  cuisine: string
  price_range: string
  menu_items: any[]
  profitable_dishes: any
  upselling_style: string
  dietary_restrictions: string[]
  special_services: string[]
  payment_methods: string[]
  dress_code: string
  brand_colors: any
  chatbot_settings: any
}

export default function EmbedPage() {
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Get widget ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const widgetId = urlParams.get('id')
    
    if (widgetId) {
      fetchRestaurantData(widgetId)
    }
  }, [])

  const fetchRestaurantData = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/widget/${widgetId}`)
      if (response.ok) {
        const data = await response.json()
        setRestaurantData(data)
        
        // Add welcome message
        setMessages([{
          id: '1',
          text: `Welcome to ${data.name}! How can I help you today?`,
          isUser: false,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          restaurantData: restaurantData
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!restaurantData) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: restaurantData.brand_colors?.primary || '#4F46E5' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <Bot className="w-5 h-5" style={{ color: restaurantData.brand_colors?.primary || '#4F46E5' }} />
          </div>
          <div>
            <h3 className="text-white font-semibold">{restaurantData.name}</h3>
            <p className="text-white text-sm opacity-90">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat Area */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: restaurantData.brand_colors?.primary || '#4F46E5' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}