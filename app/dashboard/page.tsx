'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bot, LogOut, Settings, BarChart3, Globe, User, Building, Clock, MapPin, Phone, Mail, Save, Zap, ArrowRight, Package, Home, DollarSign, TrendingUp, MessageSquare, Copy, Check, TestTube, AlertTriangle, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MenuReview from '@/app/components/MenuReview'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    hours: 'Mon-Fri: 11:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@restaurant.com',
    description: 'Fine dining with a modern twist, featuring fresh local ingredients.',
    specialties: 'Italian cuisine, fresh pasta, wood-fired pizza'
  })
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [settingsData, setSettingsData] = useState<any>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isRestaurantActive, setIsRestaurantActive] = useState(true)
  const [widgetRefreshKey, setWidgetRefreshKey] = useState(0)

  // Get user role (must be before any conditional returns)
  const userRole = (session?.user as any)?.role || (session?.user as any)?.image // Check both role and image (fallback)
  const isAdmin = userRole === 'admin'
  const isSalesRep = userRole === 'sales_rep'
  const hasChatbot = true // Everyone has chatbot in beta

  // Combined useEffect for all side effects (must be before any conditional returns)
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Redirect based on role
    if (status === 'authenticated') {
      if (isAdmin) {
        router.push('/admin')
        return
      }
      if (isSalesRep) {
        router.push('/sales-dashboard')
        return
      }
    }

    // Update restaurant info from session
    if (session?.user) {
      setRestaurantInfo(prev => ({
        ...prev,
        name: session.user?.name || 'My Restaurant',
        email: session.user?.email || 'info@restaurant.com'
      }))
    }
  }, [status, session, router, isAdmin, isSalesRep])

  // Fetch analytics function (defined before useEffect that uses it)
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const response = await fetch('/api/analytics/restaurant')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
        if (data.restaurant) {
          setWidgetId(data.restaurant.widget_id || null)
          setRestaurantInfo(prev => ({
            ...prev,
            name: data.restaurant.name || prev.name
          }))
        }
      }
      // Also fetch restaurant status
      const restaurantResponse = await fetch('/api/restaurant/owner')
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        setIsRestaurantActive(restaurantData.isActive !== false)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  // Separate useEffect for analytics fetching
  useEffect(() => {
    if (status === 'authenticated' && !isAdmin && !isSalesRep) {
      fetchAnalytics()
    }
  }, [status, isAdmin, isSalesRep])

  // Fetch restaurant and menu data for settings
  const fetchSettingsData = async () => {
    setIsLoadingSettings(true)
    try {
      const response = await fetch('/api/restaurant/owner')
      if (response.ok) {
        const data = await response.json()
        setSettingsData(data)
        setWidgetId(data.widgetId)
        setIsRestaurantActive(data.isActive !== false) // Default to true if not specified
      }
    } catch (error) {
      console.error('Error fetching settings data:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  // Fetch settings data when Settings tab is opened
  useEffect(() => {
    if (activeTab === 'settings' && status === 'authenticated' && !isAdmin && !isSalesRep && !settingsData) {
      fetchSettingsData()
    }
  }, [activeTab, status, isAdmin, isSalesRep])

  // All hooks must be called before any conditional returns
  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/marketing' })
  }

  const handleCopyScript = async () => {
    if (!widgetId) return
    
    const script = `<script 
  id="restaurant-chatbot-widget-script"
  src="https://restaurant-ai-chatbot.vercel.app/widget.js" 
  data-widget-id="${widgetId}"
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
      // Fallback: select and copy
      const textArea = document.createElement('textarea')
      textArea.value = script
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSettingsSave = async (menuItems: any[], restaurantInfo?: any) => {
    if (!widgetId) {
      alert('Widget ID not found. Please refresh the page.')
      return
    }

    try {
      // Format restaurant data for API
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
        websiteUrl: restaurantInfo?.websiteUrl,
        brandColors: restaurantInfo?.brandColors
      }
      if (restaurantInfo?.deliveryLinks !== undefined) {
        updateData.deliveryLinks = restaurantInfo.deliveryLinks
      }
      if (restaurantInfo?.reservationLink !== undefined) {
        updateData.reservationLink = restaurantInfo.reservationLink
      }
      if (restaurantInfo?.specialServices !== undefined) {
        updateData.special_services = restaurantInfo.specialServices
      }
      

      // Handle address
      if (typeof addressData === 'object') {
        updateData.address_street = addressData.street || null
        updateData.address_city = addressData.city || null
        updateData.address_state = addressData.state || null
        updateData.address_zip = addressData.zip || null
        updateData.address_country = addressData.country || 'USA'
      }

      // Format menu items
      const menuItemsToUpdate = menuItems.map((item: any) => ({
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        dietaryTags: item.dietaryTags || [],
        menuType: item.menuType || null
      }))

      updateData.menu_items = menuItemsToUpdate

      // Get profitable dishes - always include this field, even if empty (to clear existing profitable dishes)
      const profitableItems = menuItems.filter((item: any) => item.isProfitable)
      updateData.profitable_dishes = profitableItems.length > 0
        ? {
            dish_ids: [], // Will be updated after menu items are saved
            dish_names: profitableItems.map((item: any) => item.name)
          }
        : null // Explicitly set to null to clear profitable dishes if none are selected

      const response = await fetch('/api/update-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId,
          updateData
        })
      })

      if (response.ok) {
        alert('Settings saved successfully!')
        // Refresh settings data
        fetchSettingsData()
        // Refresh analytics
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
    // Just refresh the data to show current state
    fetchSettingsData()
  }

  // Now safe to have conditional returns
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Empty state for users without chatbot
  if (!hasChatbot) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/marketing')}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                  <button
                    onClick={() => router.push('/demo')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Demo
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Empty State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-xl p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to RestaurantAI! 🎉
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                You don't have an AI chatbot set up yet. Let's get you started with a plan 
                that fits your restaurant's needs.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">What happens next:</h3>
                <div className="text-left max-w-md mx-auto space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Choose your plan</p>
                      <p className="text-sm text-gray-600">Select a pricing tier that fits your restaurant</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">We set up your chatbot</p>
                      <p className="text-sm text-gray-600">Our team configures everything for you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Go live in 24 hours!</p>
                      <p className="text-sm text-gray-600">We integrate the chatbot into your website</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/marketing#pricing')}
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Choose a Plan
                </button>
                <button
                  onClick={() => router.push('/demo')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Bot className="w-5 h-5" />
                  See Demo
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                🚀 Beta Program • Help shape the product
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard for users WITH chatbot (admin or paid users)
  return (
    <div className="min-h-screen bg-gray-50">
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
                <div>
                  <span className="text-xl font-bold text-gray-900">RestaurantAI</span>
                  {isAdmin && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Admin</span>
                  )}
                </div>
              </button>
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => router.push('/marketing')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
        </nav>

        {/* Paused Restaurant Banner */}
        {!isRestaurantActive && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Your chatbot is currently paused
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your chatbot has been temporarily disabled and is not visible on your website. Please contact support if you have any questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your restaurant's AI chatbot and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integration'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Integration
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/service-dashboard')}
                  className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Service Dashboard
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
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

                {/* Monthly Activity Line Chart */}
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

                {/* Most Popular Menu Items - Separated by User vs Chatbot */}
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

                {/* Common Questions */}
                {analytics?.commonQuestions && analytics.commonQuestions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Questions</h3>
                    <div className="space-y-2">
                      {analytics.commonQuestions.map((item: any, index: number) => {
                        // Handle both string format (legacy) and object format (current)
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

                {/* Engagement Metrics */}
                {analytics?.avgMessagesPerConversation && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Avg Messages per Conversation</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.avgMessagesPerConversation}</p>
                        <p className="text-xs text-gray-500 mt-1">Higher = more engaged customers</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Messages This Week</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.messagesThisWeek || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                      </div>
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
                ) : settingsData ? (
                  <MenuReview
                    menuItems={settingsData.menuItems || []}
                    restaurantInfo={settingsData.restaurant}
                    onApprove={handleSettingsSave}
                    onCancel={handleSettingsCancel}
                    onFieldSave={handleSettingsSave}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No restaurant data found. Please contact support.</p>
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
                      Test your chatbot here. All messages will be saved to the database and reflected in your analytics.
                    </p>
                  </div>
                  {widgetId && (
                    <button
                      onClick={() => setWidgetRefreshKey(prev => prev + 1)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Widget
                    </button>
                  )}
                </div>
                
                {widgetId ? (
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
                          src={`/widget/${widgetId}?test=true&t=${Date.now()}`}
                          key={`${widgetId}-${widgetRefreshKey}`} // Force iframe reload when refresh key changes
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
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-400">
                        Messages sent here will appear in your Overview analytics
                      </p>
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
                
                {widgetId ? (
                  <>
                    <div className="bg-gray-900 rounded-lg p-6 relative">
                      <code className="text-green-400 text-sm block whitespace-pre-wrap">
                        {`<script 
  id="restaurant-chatbot-widget-script"
  src="https://restaurant-ai-chatbot.vercel.app/widget.js" 
  data-widget-id="${widgetId}"
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