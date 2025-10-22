'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, ArrowLeft, Home, Phone, Mail, MapPin, Clock, Star, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function MediterraneanDemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Azura! How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [showBubble, setShowBubble] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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

  const [isLoading, setIsLoading] = useState(false)

  // Function to make contact info clickable
  const renderClickableText = (text: string) => {
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g
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
    const textToSend = messageText || inputMessage
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
      setInputMessage('')
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
        text: "Our menu features authentic Mediterranean cuisine with fresh ingredients and traditional recipes. We offer appetizers, main courses, salads, and beverages. Do you have any questions on specific dishes or do you need any recommendations?",
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage, aiMessage])
      setInputMessage('')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(0, -1),
          restaurantContext: `RESTAURANT: Azura Mediterranean Restaurant
HOURS: Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, Sunday 12pm-9pm
PHONE: (555) 123-4567
EMAIL: info@azurarestaurant.com
ADDRESS: 123 Mediterranean Way, Denver, CO 80202

MENU:
APPETIZERS: Hummus Trio ($12), Falafel Platter ($14), Mediterranean Bruschetta ($10), Baba Ganoush ($11), Stuffed Grape Leaves ($9), Mediterranean Cheese Board ($16)
MAIN COURSES: Lamb Kebab ($24), Chicken Shawarma ($18), Mediterranean Seafood Platter ($28), Beef Kofta ($20), Vegetarian Moussaka ($16), Grilled Salmon ($26)
SALADS & SIDES: Greek Salad ($12), Mediterranean Quinoa Bowl ($14), Grilled Vegetable Platter ($13), Rice Pilaf ($6), Roasted Potatoes ($7), Pita Bread ($4)
BEVERAGES: Mediterranean Sunset Cocktail ($12), Greek Ouzo Martini ($11), House Red Wine ($8), Greek White Wine ($9), Mediterranean Sangria ($10), Craft Beer ($6), Fresh Mint Tea ($4), Turkish Coffee ($5), Fresh Lemonade ($5), Mediterranean Iced Tea ($4), Fresh Orange Juice ($5), Sparkling Water ($3)`
        }),
      })

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
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

  const suggestedQuestions = [
    { label: "Hours", question: "What are your hours?" },
    { label: "Dietary", question: "dietary_question" },
    { label: "Menu", question: "menu_overview" },
    { label: "Contact", question: "What's your phone number?" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/marketing" className="text-2xl font-bold text-primary-600">
                RestaurantAI
              </Link>
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
              <Link href="/demo" className="text-gray-600 hover:text-primary-600">
                Demo
              </Link>
              <a href="/signup" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Join Beta
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/marketing"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors md:hidden"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Restaurant Website */}
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative h-[500px] bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'}}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-6xl font-bold mb-6 tracking-tight">Azura Mediterranean Restaurant</h1>
              <p className="text-2xl mb-8 font-light">Authentic Mediterranean Cuisine in the Heart of Denver</p>
              <div className="flex items-center justify-center space-x-8 text-lg">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="font-semibold">247 Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">Welcome to Azura</h2>
            <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Experience the authentic flavors of the Mediterranean with our carefully crafted menu featuring fresh ingredients, traditional recipes, and modern presentation. From our famous lamb kebabs to our signature hummus trio, every dish tells a story of culinary excellence.
            </p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Menu</h2>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto">Fresh ingredients, authentic flavors, unforgettable experiences</p>
            </div>

            {/* Featured Dishes */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Dishes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Lamb Kebab" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Lamb Kebab</h4>
                    <p className="text-gray-600 mb-4">Grilled lamb with rice pilaf and grilled vegetables</p>
                    <span className="text-2xl font-bold text-primary-600">$24</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Hummus Trio" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Hummus Trio</h4>
                    <p className="text-gray-600 mb-4">Classic, roasted red pepper, and garlic hummus with warm pita</p>
                    <span className="text-2xl font-bold text-primary-600">$12</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Mediterranean Seafood" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Mediterranean Seafood Platter</h4>
                    <p className="text-gray-600 mb-4">Grilled fish, shrimp, and calamari with lemon herb sauce</p>
                    <span className="text-2xl font-bold text-primary-600">$28</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Appetizers & Mezze */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Appetizers & Mezze</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Hummus Trio</h4>
                          <p className="text-gray-600 text-sm">Classic, roasted red pepper, and garlic hummus with warm pita</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$12</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Falafel Platter</h4>
                          <p className="text-gray-600 text-sm">Crispy falafel with tahini sauce and fresh vegetables</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$14</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Mediterranean Bruschetta</h4>
                          <p className="text-gray-600 text-sm">Grilled bread with tomatoes, olives, and feta cheese</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$10</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Baba Ganoush</h4>
                          <p className="text-gray-600 text-sm">Smoky eggplant dip with pita bread and olive oil</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$11</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Stuffed Grape Leaves</h4>
                          <p className="text-gray-600 text-sm">Rice and herbs wrapped in grape leaves with lemon sauce</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$9</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Mediterranean Cheese Board</h4>
                          <p className="text-gray-600 text-sm">Selection of Mediterranean cheeses with olives and crackers</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$16</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Courses */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Main Courses</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Lamb Kebab</h4>
                          <p className="text-gray-600 text-sm">Grilled lamb with rice pilaf and grilled vegetables</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$24</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Chicken Shawarma</h4>
                          <p className="text-gray-600 text-sm">Marinated chicken with garlic sauce and fresh vegetables</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$18</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Mediterranean Seafood Platter</h4>
                          <p className="text-gray-600 text-sm">Grilled fish, shrimp, and calamari with lemon herb sauce</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$28</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Beef Kofta</h4>
                          <p className="text-gray-600 text-sm">Spiced ground beef with rice and grilled vegetables</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$20</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Vegetarian Moussaka</h4>
                          <p className="text-gray-600 text-sm">Layered eggplant with tomato sauce and béchamel</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$16</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Grilled Salmon</h4>
                          <p className="text-gray-600 text-sm">Mediterranean herbs with quinoa and seasonal vegetables</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$26</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salads & Sides */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Salads & Sides</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Greek Salad</h4>
                          <p className="text-gray-600 text-sm">Fresh tomatoes, cucumbers, olives, and feta cheese</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$12</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Mediterranean Quinoa Bowl</h4>
                          <p className="text-gray-600 text-sm">Quinoa with roasted vegetables and tahini dressing</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$14</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Grilled Vegetable Platter</h4>
                          <p className="text-gray-600 text-sm">Seasonal vegetables with olive oil and herbs</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$13</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Rice Pilaf</h4>
                          <p className="text-gray-600 text-sm">Fragrant basmati rice with herbs and spices</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$6</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Roasted Potatoes</h4>
                          <p className="text-gray-600 text-sm">Mediterranean herbs and olive oil</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$7</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Pita Bread</h4>
                          <p className="text-gray-600 text-sm">Fresh baked pita with olive oil</p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600">$4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Beverages Section */}
            <div className="mt-16 bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center">Beverages</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Wine & Cocktails */}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Wine & Cocktails</h4>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Mediterranean Sunset Cocktail</span>
                        <span className="font-semibold text-primary-600">$12</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Greek Ouzo Martini</span>
                        <span className="font-semibold text-primary-600">$11</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">House Red Wine (Glass)</span>
                        <span className="font-semibold text-primary-600">$8</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Greek White Wine (Glass)</span>
                        <span className="font-semibold text-primary-600">$9</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Mediterranean Sangria</span>
                        <span className="font-semibold text-primary-600">$10</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Craft Beer Selection</span>
                        <span className="font-semibold text-primary-600">$6</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Alcoholic */}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Non-Alcoholic</h4>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fresh Mint Tea</span>
                        <span className="font-semibold text-primary-600">$4</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Turkish Coffee</span>
                        <span className="font-semibold text-primary-600">$5</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fresh Lemonade</span>
                        <span className="font-semibold text-primary-600">$5</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Mediterranean Iced Tea</span>
                        <span className="font-semibold text-primary-600">$4</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fresh Orange Juice</span>
                        <span className="font-semibold text-primary-600">$5</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Sparkling Water</span>
                        <span className="font-semibold text-primary-600">$3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Azura Mediterranean</h3>
                <p className="text-gray-300 mb-4">
                  Authentic Mediterranean cuisine in the heart of Denver. Fresh ingredients, traditional recipes, and warm hospitality.
                </p>
                <div className="flex items-center text-gray-300">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>4.8/5 stars on Google Reviews</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">info@azurarestaurant.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">123 Mediterranean Way, Denver, CO 80202</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Hours</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Monday-Thursday: 11am-10pm</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Friday-Saturday: 11am-11pm</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Sunday: 12pm-9pm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <div className="flex items-end gap-3">
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
              className="bg-primary-600 text-white p-3.5 rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5.5 h-5.5" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-80 h-[500px] flex flex-col border border-gray-200">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Azura Assistant</span>
                  <p className="text-xs text-white/70">Powered by RestaurantAI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 pl-3 pr-5 py-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {!message.isUser && (
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-2 py-1.5 rounded-lg ${
                        message.isUser
                          ? 'text-white'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                      style={message.isUser ? { backgroundColor: '#0284c7' } : {}}
                    >
                      <p 
                        className="text-xs leading-tight whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: renderClickableText(message.text) }}
                      />
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-2 py-1.5 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item.question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{ color: '#111827' }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}