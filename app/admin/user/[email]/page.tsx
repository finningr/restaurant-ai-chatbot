'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bot, LogOut, Home, ArrowLeft, Building2, UserCheck, Mail, Phone, Globe, ExternalLink, Eye, Settings } from 'lucide-react'
import { BarChart3, DollarSign, MessageSquare, TrendingUp, Clock, MapPin } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import MenuReview from '@/app/components/MenuReview'

export default function AdminUserViewPage({ params }: { params: { email: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  const userEmail = decodeURIComponent(params.email)
  
  const [userInfo, setUserInfo] = useState<any>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [settingsData, setSettingsData] = useState<any>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    const userRole = (session?.user as any)?.role
    if (userRole !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch user info first
        let user: any = null
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          user = usersData.find((u: any) => u.email === userEmail)
          setUserInfo(user)
        }

        if (role === 'restaurant') {
          // Fetch restaurants for this owner
          const restaurantsResponse = await fetch(`/api/restaurants?owner_email=${encodeURIComponent(userEmail)}`)
          if (restaurantsResponse.ok) {
            const restaurantsData = await restaurantsResponse.json()
            setRestaurants(restaurantsData)
            
            // If there's a restaurant, fetch analytics for the first one
            if (restaurantsData.length > 0 && restaurantsData[0].widget_id) {
              setWidgetId(restaurantsData[0].widget_id)
              fetchAnalytics(restaurantsData[0].widget_id)
            }
          }
        } else if (role === 'sales_rep' || role === 'admin') {
          // For sales reps and admins, fetch restaurants created by them
          const restaurantsResponse = await fetch(`/api/restaurants?created_by=${encodeURIComponent(userEmail)}&show_deleted=true`)
          if (restaurantsResponse.ok) {
            const restaurantsData = await restaurantsResponse.json()
            // If sales rep is deleted, filter out demos (non-onboarded restaurants)
            // but keep active restaurants (onboarded)
            if (user?.status === 'deleted' && role === 'sales_rep') {
              const filtered = restaurantsData.filter((r: any) => r.is_onboarded === true)
              setRestaurants(filtered)
            } else {
              setRestaurants(restaurantsData)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, userEmail, role])

  const fetchAnalytics = async (widgetIdParam: string) => {
    try {
      const response = await fetch(`/api/analytics/restaurant?widget_id=${widgetIdParam}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchSettingsData = async () => {
    setIsLoadingSettings(true)
    try {
      const response = await fetch(`/api/restaurant/owner?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setSettingsData(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'settings' && !settingsData) {
      fetchSettingsData()
    }
  }, [activeTab])

  const handleSettingsSave = async (editedData: any) => {
    try {
      const response = await fetch('/api/update-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: widgetId,
          ...editedData
        })
      })
      
      if (response.ok) {
        // Refresh settings data
        await fetchSettingsData()
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/marketing' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin
                </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                role === 'sales_rep' ? 'bg-blue-100' : role === 'admin' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {role === 'sales_rep' ? (
                  <UserCheck className="w-8 h-8 text-blue-600" />
                ) : role === 'admin' ? (
                  <Settings className="w-8 h-8 text-yellow-600" />
                ) : (
                  <Building2 className="w-8 h-8 text-green-600" />
                )}
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  userInfo?.status === 'deleted' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {userInfo?.name || 'User'}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {userEmail}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    role === 'sales_rep'
                      ? 'bg-blue-100 text-blue-800'
                      : role === 'admin'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {role === 'sales_rep' ? 'Sales Representative' : role === 'admin' ? 'Admin' : 'Restaurant Owner'}
                  </span>
                  {userInfo?.status === 'deleted' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Deleted
                    </span>
                  )}
                  {userInfo?.status === 'paused' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Paused
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {role === 'restaurant' && restaurants.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'settings'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Analytics Cards */}
                {analytics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Conversations</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalConversations || 0}</p>
                          </div>
                          <MessageSquare className="w-8 h-8 text-primary-600" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Estimated Revenue Impact</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${analytics.estimatedRevenueImpact?.toLocaleString() || 0}</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Messages</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalMessages || 0}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Engagement Depth</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.engagementDepth?.toFixed(1) || 0}</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* Charts */}
                    {analytics.dailyActivity && analytics.dailyActivity.length > 0 && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Activity</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.dailyActivity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="conversations" stroke="#4F46E5" name="Conversations" />
                            <Line type="monotone" dataKey="messages" stroke="#10B981" name="Messages" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Popular Menu Items */}
                    {analytics.mostPopularMenuItems && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Menu Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">User Mentions</h4>
                            <div className="space-y-2">
                              {analytics.mostPopularMenuItems.userMentions?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-gray-900">{item.name}</span>
                                  <span className="text-sm text-gray-600">{item.mentions} mentions</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">Chatbot Recommendations</h4>
                            <div className="space-y-2">
                              {analytics.mostPopularMenuItems.chatbotRecommendations?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-gray-900">{item.name}</span>
                                  <span className="text-sm text-gray-600">{item.recommendations} recommendations</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Common Questions */}
                    {analytics.commonQuestions && analytics.commonQuestions.length > 0 && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Questions</h3>
                        <div className="space-y-2">
                          {analytics.commonQuestions.map((q: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="text-gray-900">{q.question}</span>
                              <span className="text-sm text-gray-600">{q.count} times</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {isLoadingSettings ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : settingsData ? (
                  <MenuReview
                    restaurantInfo={settingsData.restaurant}
                    menuItems={settingsData.menuItems || []}
                    onApprove={handleSettingsSave}
                    onCancel={() => {}}
                  />
                ) : (
                  <p className="text-gray-500">No settings data available</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Sales Rep or Admin View */}
        {(role === 'sales_rep' || role === 'admin') && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {role === 'admin' ? 'Restaurants Created' : 'Demos Created'}
            </h2>
            {restaurants.length > 0 ? (
              <div className="grid gap-4">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/admin/restaurant/${restaurant.widget_id}/dashboard`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/restaurant/${restaurant.widget_id}/dashboard`)
                            }}
                            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-left"
                          >
                            {restaurant.name}
                          </button>
                          {restaurant.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{restaurant.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {restaurant.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {restaurant.phone}
                              </p>
                            )}
                            {restaurant.email && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {restaurant.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="flex items-center gap-2">
                            {restaurant.deleted_at ? (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Deleted
                              </span>
                            ) : restaurant.is_active ? (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Paused
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/restaurant/${restaurant.widget_id}/dashboard`)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No demos created yet</p>
              </div>
            )}
          </div>
        )}

        {/* Restaurant Owner with no restaurants */}
        {role === 'restaurant' && restaurants.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">This restaurant owner has no restaurants yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

