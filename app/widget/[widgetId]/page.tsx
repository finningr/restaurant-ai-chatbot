'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Bot, User, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react'
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
  delivery_links?: Record<string, string | Array<{ name: string; url: string }>>
  reservation_link?: string | null
  catering_link?: string | null
  special_services?: string[]
  is_active: boolean
}

function formatHoursForContext(hours: any): string {
  if (!hours) return ''
  if (typeof hours === 'string') return hours
  const h = hours as { main?: Record<string, string>; kitchen?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string }
  const hasValues = (dayHours: Record<string, string> | undefined) => dayHours && typeof dayHours === 'object' && Object.values(dayHours).some((v) => v && String(v).trim())
  const fmt = (dayHours: Record<string, string> | undefined) => {
    if (!dayHours || typeof dayHours !== 'object') return ''
    return Object.entries(dayHours)
      .map(([d, t]) => `${d.charAt(0).toUpperCase() + d.slice(1)}: ${t}`)
      .join('; ')
  }
  const parts: string[] = []
  if (hasValues(h.main)) parts.push(`Main hours: ${fmt(h.main)}`)
  if (hasValues(h.kitchen)) parts.push(`Kitchen hours (last order): ${fmt(h.kitchen)}`)
  if (hasValues(h.pickup)) parts.push(`Pickup/Takeout hours: ${fmt(h.pickup)}`)
  if (h.happy_hour?.trim()) parts.push(`Happy hour: ${h.happy_hour}`)
  if (h.brunch?.trim()) parts.push(`Brunch: ${h.brunch}`)
  if (h.bar?.trim()) parts.push(`Bar hours: ${h.bar}`)
  if (h.holiday?.trim()) parts.push(`Holiday hours: ${h.holiday}`)
  if (parts.length > 0) return parts.join('\n')
  if (typeof hours === 'object' && !(hours as any).main) return JSON.stringify(hours)
  return ''
}

const DAY_ALIASES: Record<string, string> = {
  sun: 'sunday', mon: 'monday', tue: 'tuesday', wed: 'wednesday',
  thu: 'thursday', fri: 'friday', sat: 'saturday'
}

/** Look up a day's hours from main hours. Keys can be monday, mon, Monday, etc. */
function getDayHours(main: Record<string, string> | undefined, weekday: string): string {
  if (!main || typeof main !== 'object') return ''
  const w = weekday.toLowerCase()
  const full = DAY_ALIASES[w] || w
  const key = Object.keys(main).find((k) => {
    const kk = k.toLowerCase()
    return kk === full || kk === w || DAY_ALIASES[kk] === full
  })
  return key ? (main[key] || '').trim() : ''
}

/** Parse "11:00 AM - 10:00 PM" to [openMinutes, closeMinutes] or null if closed/unparseable. */
function parseHoursToMinutes(h: string): [number, number] | null {
  if (!h || !h.trim() || /closed/i.test(h)) return null
  const match = h.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[-–—to]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
  if (!match) return null
  const [, openH, openM, openAmPm, closeH, closeM, closeAmPm] = match
  const toMins = (h: string, m: string, ampm: string) => {
    let hh = parseInt(h || '0', 10)
    const mm = parseInt(m || '0', 10)
    if (/pm/i.test(ampm) && hh !== 12) hh += 12
    if (/am/i.test(ampm) && hh === 12) hh = 0
    return hh * 60 + mm
  }
  const open = toMins(openH!, openM || '0', openAmPm!)
  let close = toMins(closeH!, closeM || '0', closeAmPm!)
  if (close < open) close += 24 * 60 // e.g. 11 PM - 2 AM
  return [open, close]
}

/** Pre-compute today and tomorrow hours for reliable status answers (uses user's local time). */
function getTodayTomorrowHours(hours: any): string {
  if (!hours?.main || typeof hours.main !== 'object') return ''
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const todayIdx = now.getDay()
  const tomorrowIdx = (todayIdx + 1) % 7
  const todayName = days[todayIdx]
  const tomorrowName = days[tomorrowIdx]
  const todayDisplay = todayName.charAt(0).toUpperCase() + todayName.slice(1)
  const tomorrowDisplay = tomorrowName.charAt(0).toUpperCase() + tomorrowName.slice(1)
  const todayH = getDayHours(hours.main, todayName)
  const tomorrowH = getDayHours(hours.main, tomorrowName)
  const todayStr = todayH ? todayH : 'Closed'
  const tomorrowStr = tomorrowH ? tomorrowH : 'Closed'
  const todayRange = parseHoursToMinutes(todayH || '')
  const openNow = todayRange ? nowMins >= todayRange[0] && nowMins <= todayRange[1] : false
  return `\nPRECOMPUTED STATUS (use these for "open now?" and "open tomorrow?"):
- Today (${todayDisplay}): ${todayStr}
- Tomorrow (${tomorrowDisplay}): ${tomorrowStr}
- Open right now: ${openNow ? 'Yes' : 'No'}`
}

/** Per-weekday lookup for "what about tuesday?" etc. Use Main hours; empty/Closed = closed. */
function getWeekdayLookup(hours: any): string {
  if (!hours?.main || typeof hours.main !== 'object') return ''
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const lines = days.map((d) => {
    const h = getDayHours(hours.main, d)
    const display = d.charAt(0).toUpperCase() + d.slice(1)
    return `${display}: ${h && h.trim() ? h.trim() : 'Closed'}`
  })
  return `\nWEEKDAY LOOKUP (use for "what about [day]?" e.g. "what about tuesday?"—look up the named day here, NOT tomorrow):
${lines.join('\n')}`
}

function buildRestaurantContext(restaurantData: RestaurantData): string {
  const hoursStr = formatHoursForContext(restaurantData.hours) || JSON.stringify(restaurantData.hours)
  const todayTomorrow = getTodayTomorrowHours(restaurantData.hours)
  const weekdayLookup = getWeekdayLookup(restaurantData.hours)
  let ctx = `Restaurant: ${restaurantData.name}
Description: ${restaurantData.description}
Phone: ${restaurantData.phone}
Email: ${restaurantData.email}
Address: ${restaurantData.address_street}, ${restaurantData.address_city}, ${restaurantData.address_state} ${restaurantData.address_zip}
Hours:
${hoursStr}${todayTomorrow}${weekdayLookup}
Cuisine: ${restaurantData.cuisine}
Price Range: ${restaurantData.price_range}`
  if (restaurantData.reservation_link) {
    ctx += `\nReservation link: ${restaurantData.reservation_link}`
  }
  if (restaurantData.catering_link) {
    ctx += `\nCatering link: ${restaurantData.catering_link}`
  }
  const links = restaurantData.delivery_links
  if (links && typeof links === 'object' && Object.keys(links).length > 0) {
    const parts: string[] = []
    if (links.website_order && typeof links.website_order === 'string') parts.push(`Order on our website: ${links.website_order}`)
    if (links.doordash && typeof links.doordash === 'string') parts.push(`DoorDash: ${links.doordash}`)
    if (links.uber_eats && typeof links.uber_eats === 'string') parts.push(`Uber Eats: ${links.uber_eats}`)
    if (links.grubhub && typeof links.grubhub === 'string') parts.push(`Grubhub: ${links.grubhub}`)
    const custom = links.custom
    if (Array.isArray(custom)) {
      custom.forEach((c: { name: string; url: string }) => {
        if (c?.name && c?.url) parts.push(`${c.name}: ${c.url}`)
      })
    }
    if (parts.length > 0) {
      ctx += `\nDelivery/Ordering Links:\n${parts.join('\n')}`
    }
  }
  const svc = restaurantData.special_services
  if (Array.isArray(svc) && svc.length > 0) {
    ctx += `\nSpecial Services Offered: ${svc.join(', ')}`
  }
  return ctx
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
  feedback?: 'positive' | 'negative' | null
  conversation_log_id?: string
  response_metrics_id?: string
}

function WidgetPageContent() {
  const params = useParams()
  const widgetId = params.widgetId as string
  // Use state to avoid hydration mismatch - start with false, update after mount
  const [isTestMode, setIsTestMode] = useState(false)
  
  useEffect(() => {
    // Set test mode after component mounts to avoid hydration mismatch
    setIsTestMode(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true')
  }, [])
  
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
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const fetchInProgressRef = useRef(false) // Prevent multiple simultaneous fetches
  const hasLoadedRef = useRef(false) // Track if data has been successfully loaded
  const retryCountRef = useRef(0) // Track retry attempts

  // Load restaurant data and apply brand colors
  useEffect(() => {
    // Don't reload if we've already successfully loaded
    if (hasLoadedRef.current) {
      return
    }
    
    if (!widgetId) return
    
    const loadRestaurantData = async () => {
      // Prevent multiple simultaneous fetches
      if (fetchInProgressRef.current) {
        return
      }
      
      try {
        fetchInProgressRef.current = true
        setIsLoading(true)
        
        // Small delay on first attempt to ensure Next.js route is ready
        // In dev mode, Next.js lazy-compiles routes, so we need to wait a bit
        if (retryCountRef.current === 0) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Increased from 100ms to 500ms
        }
        
        // Fetch restaurant data (removed cache-busting timestamp to prevent reloads)
        // Include test=true if we're in test mode
        const isTestMode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('test') === 'true' : false
        const apiUrl = `/api/widget/${widgetId}${isTestMode ? '?test=true' : ''}`
        
        const currentAttempt = retryCountRef.current + 1
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            url: apiUrl
          })
          throw new Error(`Failed to load restaurant data: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        setRestaurantData(data.restaurant)
        setMenuItems(data.menuItems)
        
        // Mark as successfully loaded and reset retry count
        hasLoadedRef.current = true
        retryCountRef.current = 0
        
        // Apply brand colors - prioritize database, then URL params, then defaults
        if (data.settings?.brand_colors) {
          // Database colors take priority
          const dbColors = data.settings.brand_colors
          setBrandColors(dbColors)
        } else {
          // Fallback to URL params if no database colors (read directly from window to avoid searchParams dependency)
          const colorsParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('colors') : null
          if (colorsParam) {
            try {
              const urlColors = JSON.parse(decodeURIComponent(colorsParam))
              setBrandColors(urlColors)
            } catch (error) {
              console.error('Failed to parse brand colors:', error)
            }
          } else {
            console.warn('No brand colors found in database or URL params, using defaults')
          }
        }

        // Initialize with welcome message only if messages are empty (don't reset existing conversation)
        setMessages(prev => {
          // Only set welcome message if this is the first load (messages array is empty or only has welcome)
          if (prev.length === 0 || (prev.length === 1 && prev[0].id === '1')) {
            return [{
              id: '1',
              role: 'assistant',
              content: `Welcome to ${data.restaurant.name}! How can I help you today?`,
              timestamp: new Date()
            }]
          }
          // Otherwise, keep existing messages
          return prev
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        
        // Retry on network errors (up to 3 times with exponential backoff)
        if (isNetworkError && retryCountRef.current < 3) {
          const nextRetryCount = retryCountRef.current + 1
          retryCountRef.current = nextRetryCount
          const delay = Math.pow(2, nextRetryCount - 1) * 1000 // 1s, 2s, 4s
          // Only log retry attempts, not the error itself (to reduce console noise)
          fetchInProgressRef.current = false // Reset flag before retry
          setTimeout(() => {
            loadRestaurantData()
          }, delay)
          return // Don't set error message yet, wait for retry
        }
        
        // Only log error if we're not retrying (all retries exhausted or non-network error)
        console.error('Error loading restaurant data:', {
          message: errorMessage,
          name: error instanceof Error ? error.name : 'Unknown',
          isNetworkError,
          retryCount: retryCountRef.current
        })
        
        // Reset retry count if we're giving up
        retryCountRef.current = 0
        
        // All retries exhausted or non-network error
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Sorry, I'm having trouble loading. ${isNetworkError ? 'Network error - please check your connection.' : `Error: ${errorMessage}`} Please try again later.`,
          timestamp: new Date()
        }])
        setIsLoading(false)
        fetchInProgressRef.current = false
      } finally {
        // Reset flags if we successfully loaded or exhausted retries
        if (hasLoadedRef.current || fetchInProgressRef.current === false) {
          setIsLoading(false)
        }
      }
    }

    loadRestaurantData()
    // Only depend on widgetId - searchParams can change and cause unwanted reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetId])

  // Apply brand colors to CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', brandColors.primary)
    root.style.setProperty('--secondary-color', brandColors.secondary)
    root.style.setProperty('--accent-color', brandColors.accent)
  }, [brandColors])

  // Remove default body/html margins and padding when in test mode
  // Also ensure proper viewport scaling - match production behavior
  useEffect(() => {
    if (isTestMode) {
      // Set viewport meta tag to prevent any scaling - use device-width to avoid forced scaling
      let viewportMeta = document.querySelector('meta[name="viewport"]')
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta')
        viewportMeta.setAttribute('name', 'viewport')
        document.head.appendChild(viewportMeta)
      }
      // Use device-width to prevent forced scaling, but ensure 1:1 scale
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no')
      
      // Set explicit dimensions on html/body to match widget size
      document.documentElement.style.margin = '0'
      document.documentElement.style.padding = '0'
      document.documentElement.style.width = '350px'
      document.documentElement.style.height = '600px'
      document.documentElement.style.fontSize = '16px' // Ensure base font size
      document.documentElement.style.overflow = 'hidden'
      
      document.body.style.margin = '0'
      document.body.style.padding = '0'
      document.body.style.width = '350px'
      document.body.style.height = '600px'
      document.body.style.overflow = 'hidden'
      document.body.style.background = '#ffffff'
      document.body.style.fontSize = '16px' // Ensure base font size
      
      return () => {
        // Cleanup on unmount
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0')
        }
        document.documentElement.style.margin = ''
        document.documentElement.style.padding = ''
        document.documentElement.style.width = ''
        document.documentElement.style.height = ''
        document.documentElement.style.fontSize = ''
        document.documentElement.style.overflow = ''
        document.body.style.margin = ''
        document.body.style.padding = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.overflow = ''
        document.body.style.background = ''
        document.body.style.fontSize = ''
      }
    }
  }, [isTestMode])

  // Auto-scroll: when last message is assistant, scroll to TOP of it so user sees the answer; otherwise scroll to bottom
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') {
      lastAssistantMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative', demoOnly = false) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.feedback !== null) return
    if (!demoOnly && !message.conversation_log_id) return // Need conversation_log_id for real feedback

    // Demo: update local state only (no API call) so users see the UI
    if (demoOnly) {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback } : msg))
      return
    }

    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_log_id: message.conversation_log_id,
          response_metrics_id: message.response_metrics_id,
          feedback,
          restaurant_id: restaurantData?.id,
          session_id: sessionIdRef.current
        }),
      })

      if (response.ok) {
        // Update local state to show feedback was submitted
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, feedback }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !restaurantData) return

    const messageText = inputMessage.trim()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
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
          message: messageText,
          widget_id: widgetId,
          session_id: sessionIdRef.current,
          restaurantContext: buildRestaurantContext(restaurantData),
          menuData: menuItems,
          conversationHistory: messages.slice(0, -1).map(msg => ({
            isUser: msg.role === 'user',
            text: msg.content
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Chat API error:', response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.debug?.storage_errors?.length) {
        console.error('Storage errors:', data.debug.storage_errors)
      }
      
      if (!data.response) {
        console.error('No response in data:', data)
        throw new Error('No response from server')
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        feedback: null,
        conversation_log_id: data.conversation_log_id || undefined,
        response_metrics_id: data.response_metrics_id || undefined
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error. Please try again.',
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

  // Function to convert phone numbers, addresses, and markdown links to clickable links
  const renderClickableText = (text: string) => {
    // Markdown links [text](url) - convert first so we don't double-process
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let result = text.replace(markdownLinkRegex, (_, label, url) => {
      const escapedUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); text-decoration: underline;">${label}</a>`
    });

    // Phone number regex: matches (XXX) XXX-XXXX format
    const phoneRegex = /\((\d{3})\)\s(\d{3})-(\d{4})/g;
    // Address regex: matches street address, city, state (full name or abbreviation) zip format
    const addressRegex = /(\d+\s+[A-Za-z0-9\s]+),\s+([A-Za-z\s]+),\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]{2})\s+(\d{5}(?:-\d{4})?)/g;
    
    // Replace phone numbers with clickable links
    result = result.replace(phoneRegex, (match: string, area: string, prefix: string, suffix: string) => {
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
          widget_id: widgetId,
          session_id: sessionIdRef.current,
          restaurantContext: buildRestaurantContext(restaurantData),
          menuData: menuItems,
          conversationHistory: messages.map(msg => ({
            isUser: msg.role === 'user',
            text: msg.content
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Chat API error:', response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.debug?.storage_errors?.length) {
        console.error('Storage errors:', data.debug.storage_errors)
      }
      
      if (!data.response) {
        console.error('No response in data:', data)
        throw new Error('No response from server')
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        feedback: null,
        conversation_log_id: data.conversation_log_id || undefined,
        response_metrics_id: data.response_metrics_id || undefined
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
        <div className="bg-white flex flex-col h-full" style={{ width: '100%', height: '100%' }}>
          <div className={styles.widgetLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, position: 'relative' }}>
      <div className={`${styles.widgetContainer} flex flex-col`} style={{ width: '100%', height: '100%', margin: 0, padding: 0, borderRadius: isTestMode ? 0 : undefined, boxShadow: isTestMode ? 'none' : undefined, border: isTestMode ? 'none' : undefined }}>
        <div className={styles.widgetHeader}>
            <div className={styles.headerContent}>
              <h3>{restaurantData?.name ? `${restaurantData.name} Assistant` : 'Restaurant Assistant'}</h3>
              <p className={styles.poweredBy}>Powered by Front of House AI</p>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.minimizeButton}
                onClick={() => {
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'minimize' }, '*')
                  }
                }}
                title="Minimize"
              >
                <X size={16} />
              </button>
            </div>
          </div>

        <div className={styles.widgetMessages}>
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            ref={message.role === 'assistant' && index === messages.length - 1 ? lastAssistantMessageRef : undefined}
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.messageAvatar}>
            {message.role === 'assistant' ? (
              <Bot size={20} />
            ) : (
              <User size={20} />
            )}
            </div>
            <div className={styles.messageWrapper}>
              <div 
                className={styles.messageContent}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  const anchor = target.closest('a[href^="http"]') || target.closest('a[href^="tel:"]')
                  if (anchor instanceof HTMLAnchorElement && anchor.href) {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(anchor.href, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
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
              {message.role === 'assistant' && (message.conversation_log_id || widgetId === 'demo') && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleFeedback(message.id, 'positive', widgetId === 'demo')}
                    disabled={message.feedback !== null}
                    className={`p-1.5 rounded transition-colors ${
                      message.feedback === 'positive'
                        ? 'text-green-600 bg-green-50'
                        : message.feedback === null
                        ? 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    onClick={() => handleFeedback(message.id, 'negative', widgetId === 'demo')}
                    disabled={message.feedback !== null}
                    className={`p-1.5 rounded transition-colors ${
                      message.feedback === 'negative'
                        ? 'text-red-600 bg-red-50'
                        : message.feedback === null
                        ? 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              )}
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

        {/* Privacy Disclosure Banner */}
        <div style={{ 
          padding: '8px 12px',
          fontSize: '11px',
          lineHeight: '1.4',
          color: 'var(--primary-color)',
          backgroundColor: 'rgba(2, 132, 199, 0.05)',
          borderTop: '1px solid rgba(2, 132, 199, 0.1)',
          textAlign: 'center'
        }}>
          By chatting with us, you agree to our{' '}
          <a 
            href="https://restaurant-ai-chatbot.vercel.app/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Determine the correct base URL
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              const baseUrl = isLocalhost 
                ? `${window.location.protocol}//${window.location.host}` 
                : 'https://restaurant-ai-chatbot.vercel.app'
              const privacyUrl = `${baseUrl}/privacy`
              
              // Try to open in parent window if in iframe
              try {
                if (window.top && window.top !== window.self) {
                  window.top.open(privacyUrl, '_blank', 'noopener,noreferrer')
                } else {
                  window.open(privacyUrl, '_blank', 'noopener,noreferrer')
                }
              } catch (err) {
                // Fallback: navigate parent window if in iframe
                if (window.top && window.top !== window.self) {
                  window.top.location.href = privacyUrl
                } else {
                  window.location.href = privacyUrl
                }
              }
            }}
            style={{ 
              color: 'var(--primary-color)', 
              textDecoration: 'underline',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}

export default function WidgetPage() {
  useEffect(() => {
    // Remove default body/html margins and padding for widget page
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.documentElement.style.height = '100%'
    document.documentElement.style.width = '100%'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.height = '100%'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Cleanup on unmount
      document.documentElement.style.margin = ''
      document.documentElement.style.padding = ''
      document.documentElement.style.height = ''
      document.documentElement.style.width = ''
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.height = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [])
  
  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, display: 'flex' }}>
      <Suspense fallback={
        <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <WidgetPageContent />
      </Suspense>
    </div>
  )
}
