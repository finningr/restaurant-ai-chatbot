'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Bot, User, X, Send } from 'lucide-react'
import styles from './page.module.css'

interface RestaurantData {
  id: string
  name: string
  description: string
  phone: string
  email: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  address_country: string
  hours: any
  cuisine: string
  price_range: string
  website_url: string
  widget_id: string
  profitable_dishes: any
  is_active: boolean
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  dietary_tags: string[]
  available: boolean
}

interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function WidgetPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const widgetId = params.widgetId as string
  
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: '#4F46E5',
    secondary: '#6366F1', 
    accent: '#818CF8'
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load restaurant data and apply brand colors
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setIsLoading(true)
        
        // Get brand colors from URL params if provided
        const colorsParam = searchParams.get('colors')
        if (colorsParam) {
          try {
            const urlColors = JSON.parse(decodeURIComponent(colorsParam))
            setBrandColors(urlColors)
          } catch (error) {
            console.error('Failed to parse brand colors:', error)
          }
        }

        // Fetch restaurant data
        const response = await fetch(`/api/widget/${widgetId}`)
        if (!response.ok) {
          throw new Error('Failed to load restaurant data')
        }
        
        const data = await response.json()
        setRestaurantData(data.restaurant)
        setMenuItems(data.menuItems)
        
        // Apply brand colors from database if available
        if (data.settings?.brand_colors) {
          setBrandColors(data.settings.brand_colors)
        }

        // Initialize with welcome message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Welcome to ${data.restaurant.name}! How can I help you today?`,
          timestamp: new Date()
        }])

      } catch (error) {
        console.error('Error loading restaurant data:', error)
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Sorry, I\'m having trouble loading. Please try again later.',
          timestamp: new Date()
        }])
      } finally {
        setIsLoading(false)
      }
    }

    if (widgetId) {
      loadRestaurantData()
    }
  }, [widgetId, searchParams])

  // Apply brand colors to CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', brandColors.primary)
    root.style.setProperty('--secondary-color', brandColors.secondary)
    root.style.setProperty('--accent-color', brandColors.accent)
  }, [brandColors])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!inputMessage.trim() || !restaurantData) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          restaurantContext: `Restaurant: ${restaurantData.name}
Description: ${restaurantData.description}
Phone: ${restaurantData.phone}
Email: ${restaurantData.email}
Address: ${restaurantData.address_street}, ${restaurantData.address_city}, ${restaurantData.address_state} ${restaurantData.address_zip}
Hours: ${JSON.stringify(restaurantData.hours)}
Cuisine: ${restaurantData.cuisine}
Price Range: ${restaurantData.price_range}`,
          menuData: menuItems,
          conversationHistory: messages.slice(0, -1).map(msg => ({
            isUser: msg.role === 'user',
            text: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Function to convert phone numbers and addresses to clickable links
  const renderClickableText = (text: string) => {
    // Phone number regex: matches (XXX) XXX-XXXX format
    const phoneRegex = /\((\d{3})\)\s(\d{3})-(\d{4})/g;
    // Address regex: matches street address, city, state zip format
    const addressRegex = /(\d+\s+[A-Za-z\s]+),\s+([A-Za-z\s]+),\s+([A-Z]{2})\s+(\d{5})/g;
    
    let result = text;
    
    // Replace phone numbers with clickable links
    result = result.replace(phoneRegex, (match, area, prefix, suffix) => {
      const phoneNumber = `${area}${prefix}${suffix}`;
      return `<a href="tel:${phoneNumber}" style="color: var(--primary-color); text-decoration: underline;">${match}</a>`;
    });
    
    // Replace addresses with clickable links
    result = result.replace(addressRegex, (match, street, city, state, zip) => {
      const address = `${street}, ${city}, ${state} ${zip}`;
      const encodedAddress = encodeURIComponent(address);
      return `<a href="https://maps.google.com/maps?q=${encodedAddress}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">${match}</a>`;
    });
    
    return result;
  };

  const sendQuickMessage = async (message: string) => {
    if (!restaurantData) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          restaurantContext: `Restaurant: ${restaurantData.name}
Description: ${restaurantData.description}
Phone: ${restaurantData.phone}
Email: ${restaurantData.email}
Address: ${restaurantData.address_street}, ${restaurantData.address_city}, ${restaurantData.address_state} ${restaurantData.address_zip}
Hours: ${JSON.stringify(restaurantData.hours)}
Cuisine: ${restaurantData.cuisine}
Price Range: ${restaurantData.price_range}`,
          menuData: menuItems,
          conversationHistory: messages.map(msg => ({
            isUser: msg.role === 'user',
            text: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.widgetContainer}>
        <div className={styles.widgetLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

      return (
        <div className={styles.widgetContainer}>
          <div className={styles.widgetHeader}>
            <div className={styles.headerContent}>
              <h3>{restaurantData?.name ? `${restaurantData.name} Assistant` : 'Restaurant Assistant'}</h3>
              <p className={styles.poweredBy}>Powered by RestaurantAI</p>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.minimizeButton}
                onClick={() => {
                  // Send message to parent window to minimize the widget
                  console.log('Minimize button clicked')
                  if (window.parent && window.parent !== window) {
                    console.log('Sending minimize message to parent')
                    window.parent.postMessage({ type: 'minimize' }, '*')
                  } else {
                    console.log('No parent window found')
                  }
                }}
                title="Minimize"
              >
                <X size={16} />
              </button>
            </div>
          </div>

      <div className={styles.widgetMessages}>
        {messages.map((message) => (
          <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
            <div className={styles.messageAvatar}>
            {message.role === 'assistant' ? (
              <Bot size={20} />
            ) : (
              <User size={20} />
            )}
            </div>
            <div className={styles.messageWrapper}>
              <div className={styles.messageContent}>
                {message.content.split('\n').map((line, index) => (
                  <span key={index}>
                    <span dangerouslySetInnerHTML={{ __html: renderClickableText(line) }} />
                    {index < message.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageAvatar}>
              <Bot size={20} />
            </div>
            <div className={styles.messageWrapper}>
              <div className={`${styles.messageContent} ${styles.typing}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {messagesEndRef && <div ref={messagesEndRef} />}
      </div>

      <div className={styles.quickChatButtons}>
        <button 
          className={styles.quickButton}
          onClick={() => sendQuickMessage('What are your hours?')}
        >
          Hours
        </button>
        <button 
          className={styles.quickButton}
          onClick={() => sendQuickMessage('Tell me about your menu and what type of food you serve')}
        >
          Menu
        </button>
        <button 
          className={styles.quickButton}
          onClick={() => sendQuickMessage('Tell me about dietary accommodations')}
        >
          Dietary
        </button>
        <button 
          className={styles.quickButton}
          onClick={() => sendQuickMessage("How do we reach you?")}
        >
          Contact
        </button>
      </div>

      <div className={styles.widgetInput}>
        <div className={styles.inputContainer}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            rows={1}
            className={styles.messageInput}
          />
          <button 
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className={styles.sendButton}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
