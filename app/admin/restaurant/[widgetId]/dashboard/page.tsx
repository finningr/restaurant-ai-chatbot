'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, AlertTriangle, Lock, Unlock, Bot, LogOut, Settings, BarChart3, Globe, User, Building, Clock, MapPin, Phone, Mail, Save, Zap, ArrowRight, Package, Home, DollarSign, TrendingUp, MessageSquare, Copy, Check, TestTube, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MenuReview from '@/app/components/MenuReview'

export default function AdminRestaurantDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const widgetIdParam = params?.widgetId as string
  
  const [restaurantName, setRestaurantName] = useState<string>('')
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [widgetIdState, setWidgetId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [settingsData, setSettingsData] = useState<any>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [widgetRefreshKey, setWidgetRefreshKey] = useState(0)

  // Memoize trackActiveSession to prevent re-renders
  const trackActiveSession = useCallback(async (isActive: boolean) => {
    if (!restaurantId || !session?.user?.email) return

    try {
      await fetch('/api/admin/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          isActive,
          sessionType: 'admin'
        })
      })
    } catch (err) {
      console.error('Error tracking session:', err)
    }
  }, [restaurantId, session?.user?.email])

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    const userRole = (session?.user as any)?.role
    if (userRole !== 'admin' && userRole !== 'sales_rep') {
      router.push('/dashboard')
      return
    }
  }, [status, session?.user, router])

  // Fetch restaurant info
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!widgetIdParam) return
      
      try {
        setIsLoading(true)
        setIsLoadingSettings(true)
        // Fetch by widget_id instead
        const restaurantsRes = await fetch(`/api/restaurants?widget_id=${widgetIdParam}`)
        if (!restaurantsRes.ok) {
          setError('Restaurant not found')
          return
        }
        const restaurants = await restaurantsRes.json()
        if (!restaurants || restaurants.length === 0) {
          setError('Restaurant not found')
          return
        }
        const restaurant = restaurants[0]
        setRestaurantId(restaurant.id)
        const response = await fetch(`/api/admin/restaurant/${restaurant.id}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurantName(data.restaurant?.name || 'Restaurant')
          setIsLocked(data.restaurant?.locked_by_admin || false)
          setWidgetId(data.widgetId)
          // Set settings data in the format MenuReview expects
          setSettingsData({
            restaurant: data.restaurant,
            menuItems: data.menuItems || [],
            widgetId: data.widgetId,
            restaurantId: data.restaurantId,
            isActive: data.isActive
          })
        } else {
          setError('Restaurant not found')
        }
      } catch (err) {
        console.error('Error fetching restaurant info:', err)
        setError('Failed to load restaurant information')
      } finally {
        setIsLoading(false)
        setIsLoadingSettings(false)
      }
    }

    if (widgetIdParam && status === 'authenticated') {
      fetchRestaurantInfo()
    }
  }, [widgetIdParam, status])

  // Lock restaurant when admin enters (sales reps don't lock)
  useEffect(() => {
    const userRole = (session?.user as any)?.role
    const userEmail = session?.user?.email
    
    const lockRestaurant = async () => {
      if (!restaurantId || !userEmail || userRole !== 'admin') return

      try {
        const response = await fetch(`/api/admin/restaurant/${restaurantId}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lock: true })
        })

        if (response.ok) {
          setIsLocked(true)
          // Track active session
          await trackActiveSession(true)
        }
      } catch (err) {
        console.error('Error locking restaurant:', err)
      }
    }

    if (restaurantId && status === 'authenticated' && userRole === 'admin') {
      lockRestaurant()
    }

    // Cleanup: unlock when admin leaves
    return () => {
      if (restaurantId && userEmail && userRole === 'admin') {
        unlockRestaurant()
        trackActiveSession(false)
      }
    }
  }, [restaurantId, status, session?.user?.email, (session?.user as any)?.role, trackActiveSession]) // Add trackActiveSession to dependencies

  // Track active session (update every 30 seconds)
  useEffect(() => {
    if (!restaurantId || !session?.user?.email || status !== 'authenticated') return

    // Track immediately
    trackActiveSession(true)

    // Update every 30 seconds
    const interval = setInterval(() => {
      trackActiveSession(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [restaurantId, session?.user?.email, status, trackActiveSession])

  const unlockRestaurant = async () => {
    if (!restaurantId) return

    try {
      await fetch(`/api/admin/restaurant/${restaurantId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock: false })
      })
    } catch (err) {
      console.error('Error unlocking restaurant:', err)
    }
  }

  const handleLockToggle = async () => {
    setIsLocking(true)
    try {
      const response = await fetch(`/api/admin/restaurant/${restaurantId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock: !isLocked })
      })

      if (response.ok) {
        setIsLocked(!isLocked)
      }
    } catch (err) {
      console.error('Error toggling lock:', err)
    } finally {
      setIsLocking(false)
    }
  }

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!widgetIdState) return
    setIsLoadingAnalytics(true)
    try {
      const response = await fetch(`/api/analytics/restaurant?widget_id=${widgetIdState}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'overview' && widgetIdState && status === 'authenticated') {
      fetchAnalytics()
    }
  }, [activeTab, widgetIdState, status])

  useEffect(() => {
    if (activeTab === 'settings' && restaurantId && status === 'authenticated' && !settingsData) {
      // Settings data already loaded in initial fetch
    }
  }, [activeTab, restaurantId, status])

  const handleCopyScript = async () => {
    if (!widgetIdState) return
    
    const script = `<script 
  id="restaurant-chatbot-widget-script"
  src="https://restaurant-ai-chatbot.vercel.app/widget.js" 
  data-widget-id="${widgetIdState}"
  data-width="350"
  data-height="600"
  data-position="bottom-right"
  data-auto-open="false">
</script>`
    
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy script:', error)
    }
  }

  const handleSettingsSave = async (menuItems: any[], restaurantInfo?: any) => {
    if (!widgetIdState) {
      alert('Widget ID not found. Please refresh the page.')
      return
    }

    try {
      const addressData = typeof restaurantInfo?.address === 'object' 
        ? restaurantInfo.address 
        : restaurantInfo?.address || ''

      const updateData: any = {
        name: restaurantInfo?.name,
        description: restaurantInfo?.description,
        phone: restaurantInfo?.phone,
        email: restaurantInfo?.email,
        ownerEmail: restaurantInfo?.ownerEmail,
        cuisine: restaurantInfo?.cuisine,
        price_range: restaurantInfo?.priceRange,
        hours: restaurantInfo?.hours,
        websiteUrl: restaurantInfo?.websiteUrl
      }
      if (restaurantInfo?.deliveryLinks !== undefined) {
        updateData.deliveryLinks = restaurantInfo.deliveryLinks
      }
      if (restaurantInfo?.reservationLink !== undefined) {
        updateData.reservationLink = restaurantInfo.reservationLink
      }
      if (restaurantInfo?.cateringLink !== undefined) {
        updateData.cateringLink = restaurantInfo.cateringLink
      }
      if (restaurantInfo?.specialServices !== undefined) {
        updateData.special_services = restaurantInfo.specialServices
      }
      
      if (typeof addressData === 'object') {
        updateData.address_street = addressData.street || null
        updateData.address_city = addressData.city || null
        updateData.address_state = addressData.state || null
        updateData.address_zip = addressData.zip || null
        updateData.address_country = addressData.country || 'USA'
      }

      const menuItemsToUpdate = menuItems.map((item: any) => ({
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        dietaryTags: item.dietaryTags || [],
        menuType: item.menuType || null
      }))

      updateData.menu_items = menuItemsToUpdate

      const profitableItems = menuItems.filter((item: any) => item.isProfitable)
      updateData.profitable_dishes = profitableItems.length > 0
        ? {
            dish_ids: [],
            dish_names: profitableItems.map((item: any) => item.name)
          }
        : null

      const response = await fetch('/api/update-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: widgetIdState,
          updateData
        })
      })

      if (response.ok) {
        alert('Settings saved successfully!')
        // Refresh data
        const refreshResponse = await fetch(`/api/admin/restaurant/${restaurantId}`)
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setSettingsData({
            restaurant: refreshData.restaurant,
            menuItems: refreshData.menuItems || [],
            widgetId: refreshData.widgetId,
            restaurantId: refreshData.restaurantId,
            isActive: refreshData.isActive
          })
        }
        fetchAnalytics()
      } else {
        const error = await response.json()
        console.error('Error saving settings:', error)
        alert('Failed to save settings. Please try again.')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  const handleSettingsCancel = () => {
    // Refresh data
    if (!restaurantId) return
    fetch(`/api/admin/restaurant/${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        setSettingsData({
          restaurant: data.restaurant,
          menuItems: data.menuItems || [],
          widgetId: data.widgetId,
          restaurantId: data.restaurantId,
          isActive: data.isActive
        })
      })
      .catch(err => console.error('Error refreshing:', err))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-yellow-50 border-b-2 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-yellow-900">
                  {((session?.user as any)?.role === 'admin' ? 'ADMIN' : 'SALES REP')} VIEW
                </span>
              </div>
              <span className="text-sm text-yellow-800">
                {((session?.user as any)?.role === 'admin' ? 'Admin' : 'Sales Rep')} View - Viewing {restaurantName} - All changes save directly
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(session?.user as any)?.role === 'admin' && (
                <button
                  onClick={handleLockToggle}
                  disabled={isLocking}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isLocked
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  title={isLocked ? 'Restaurant is locked - owner cannot log in' : 'Restaurant is unlocked'}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {isLocked ? 'Locked' : 'Unlocked'}
                </button>
              )}
              <button
                onClick={() => router.push((session?.user as any)?.role === 'admin' ? '/admin' : '/sales-dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {(session?.user as any)?.role === 'admin' ? 'Admin' : 'Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/marketing')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <Bot className="w-8 h-8 text-primary-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">RestaurantAI</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {restaurantName} Dashboard
          </h1>
          <p className="text-gray-600">
            Admin view - Managing restaurant's AI chatbot and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b overflow-x-auto">
            <nav className="flex space-x-8 px-6 min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'test'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TestTube className="w-4 h-4 inline mr-2" />
                Test
              </button>
              <button
                onClick={() => setActiveTab('integration')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'integration'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Integration
              </button>
            </nav>
          </div>

          {/* Tab Content - Reuse same structure as owner dashboard */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Total Conversations</h3>
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    {isLoadingAnalytics ? (
                      <div className="h-12 flex items-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.totalConversations || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">Unique chat sessions</p>
                      </>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Total Messages</h3>
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    {isLoadingAnalytics ? (
                      <div className="h-12 flex items-center">
                        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.totalMessages || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">All-time messages</p>
                      </>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Est. Revenue Impact</h3>
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    {isLoadingAnalytics ? (
                      <div className="h-12 flex items-center">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">${analytics?.estimatedRevenueImpact?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">From chatbot interactions</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Charts and other analytics - same as owner dashboard */}
                {analytics?.dailyActivity && analytics.dailyActivity.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getMonth() + 1}/${date.getDate()}`
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="conversations" 
                          stroke="#4F46E5" 
                          strokeWidth={2}
                          name="Conversations"
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="messages" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          name="Messages"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {analytics?.mostPopularMenuItems && analytics.mostPopularMenuItems.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Menu Items</h3>
                    <div className="space-y-3">
                      {analytics.mostPopularMenuItems.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-sm font-semibold text-gray-700">{item.totalMentions} total</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">Customers asked: <span className="font-semibold text-gray-900">{item.userMentions}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600">Chatbot recommended: <span className="font-semibold text-gray-900">{item.chatbotMentions}</span></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics?.commonQuestions && analytics.commonQuestions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Questions</h3>
                    <div className="space-y-2">
                      {analytics.commonQuestions.map((item: any, index: number) => {
                        const question = typeof item === 'string' ? item : item.question || item
                        const count = typeof item === 'object' && item.count ? item.count : null
                        return (
                          <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-primary-600">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-900">{question}</p>
                              {count !== null && (
                                <span className="text-sm text-gray-500 ml-2">({count})</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading restaurant data...</p>
                    </div>
                  </div>
                ) : settingsData && settingsData.restaurant && settingsData.menuItems ? (
                  <MenuReview
                    menuItems={settingsData.menuItems || []}
                    restaurantInfo={settingsData.restaurant}
                    onApprove={handleSettingsSave}
                    onCancel={handleSettingsCancel}
                    isAdmin={true}
                    onFieldSave={handleSettingsSave}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No settings data available. Please refresh the page.</p>
                    <button
                      onClick={() => {
                        setIsLoadingSettings(true)
                        fetch(`/api/restaurants?widget_id=${widgetIdParam}`)
                          .then(res => res.json())
                          .then(restaurants => {
                            if (restaurants && restaurants.length > 0) {
                              return fetch(`/api/admin/restaurant/${restaurants[0].id}`)
                            }
                            throw new Error('Restaurant not found')
                          })
                          .then(res => res.json())
                          .then(data => {
                            setSettingsData({
                              restaurant: data.restaurant,
                              menuItems: data.menuItems || [],
                              widgetId: data.widgetId,
                              restaurantId: data.restaurantId,
                              isActive: data.isActive
                            })
                            setIsLoadingSettings(false)
                          })
                          .catch(err => {
                            console.error('Error refreshing:', err)
                            setIsLoadingSettings(false)
                          })
                      }}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'test' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Test Your Chatbot</h2>
                    <p className="text-gray-600 mt-2">
                      Test your chatbot here. All messages will be saved to the database and reflected in analytics.
                    </p>
                  </div>
                  {widgetIdState && (
                    <button
                      onClick={() => setWidgetRefreshKey(prev => prev + 1)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Widget
                    </button>
                  )}
                </div>
                
                {widgetIdState ? (
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-center items-center" style={{ minHeight: '700px', position: 'relative' }}>
                      <div 
                        id="restaurant-chatbot-widget"
                        style={{
                          position: 'relative',
                          width: '350px',
                          height: '600px',
                          borderRadius: '12px',
                          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 32px',
                          zIndex: 999999,
                          transition: '0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          transform: 'none',
                          opacity: 1,
                          pointerEvents: 'auto',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <iframe
                          src={`/widget/${widgetIdState}?test=true`}
                          key={`${widgetIdState}-${widgetRefreshKey}`}
                          style={{ 
                            border: 'none', 
                            display: 'block', 
                            width: '350px',
                            height: '600px',
                            margin: 0,
                            padding: 0,
                            transform: 'none',
                            zoom: 1,
                            minWidth: '350px',
                            minHeight: '600px'
                          }}
                          title="Chatbot Test Widget"
                          allow="clipboard-read; clipboard-write"
                          scrolling="no"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Loading widget ID... Please wait a moment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Integration Code</h2>
                
                {widgetIdState ? (
                  <>
                    <div className="bg-gray-900 rounded-lg p-6 relative">
                      <code className="text-green-400 text-sm block whitespace-pre-wrap">
                        {`<script 
  id="restaurant-chatbot-widget-script"
  src="https://restaurant-ai-chatbot.vercel.app/widget.js" 
  data-widget-id="${widgetIdState}"
  data-width="350"
  data-height="600"
  data-position="bottom-right"
  data-auto-open="false">
</script>`}
                      </code>
                    </div>
                    
                    <button
                      onClick={handleCopyScript}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Script
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Loading widget ID... Please wait a moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

