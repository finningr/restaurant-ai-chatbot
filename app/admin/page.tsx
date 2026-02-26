'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Users, UserPlus, X, Bot, LogOut, Home, Building2, UserCheck, Mail, Phone, Pause, Play, Trash2, AlertTriangle, Plus, BarChart3, TrendingUp, Activity, Server, Clock, User, Globe, DollarSign, Target, CheckCircle, XCircle, MessageSquare, Calendar, Smartphone, Monitor } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // User Management State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'restaurant' as 'restaurant' | 'sales_rep',
  })
  const [userMessage, setUserMessage] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [activeTab, setActiveTab] = useState<'owners' | 'sales-reps' | 'restaurants' | 'analytics'>('owners')
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'internal' | 'external'>('internal')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userActivity, setUserActivity] = useState<any>(null)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [activityLog, setActivityLog] = useState<any>(null)
  const [isLoadingActivityLog, setIsLoadingActivityLog] = useState(false)
  const [salesPerformance, setSalesPerformance] = useState<any>(null)
  const [isLoadingSalesPerformance, setIsLoadingSalesPerformance] = useState(false)
  const [chatbotPerformance, setChatbotPerformance] = useState<any>(null)
  const [isLoadingChatbotPerformance, setIsLoadingChatbotPerformance] = useState(false)
  const [restaurantHealth, setRestaurantHealth] = useState<any>(null)
  const [isLoadingRestaurantHealth, setIsLoadingRestaurantHealth] = useState(false)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isLoadingSystemHealth, setIsLoadingSystemHealth] = useState(false)
  const [usagePatterns, setUsagePatterns] = useState<any>(null)
  const [isLoadingUsagePatterns, setIsLoadingUsagePatterns] = useState(false)
  const [selectedRestaurantBreakdown, setSelectedRestaurantBreakdown] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<string>('30')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'pause-restaurant' | 'unpause-restaurant' | 'delete-restaurant' | 'pause-user' | 'unpause-user' | 'delete-user' | null
    item: any
    message: string
  } | null>(null)
  
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

  // Fetch users and restaurants
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch users
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setAllUsers(usersData)
        } else {
          console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText)
        }

        // Fetch restaurants (no soft delete - permanent only)
        const restaurantsResponse = await fetch(`/api/restaurants`)
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json()
          setRestaurants(restaurantsData || [])
    } else {
          const errorText = await restaurantsResponse.text()
          console.error('Failed to fetch restaurants:', restaurantsResponse.status, errorText)
          // Set empty array on error to prevent UI issues
          setRestaurants([])
  }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty arrays on error to prevent UI issues
        setAllUsers([])
        setRestaurants([])
      } finally {
        setIsLoading(false)
    }
  }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  // Fetch user activity when analytics tab is active
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'internal') return
      
      setIsLoadingActivity(true)
      try {
        const response = await fetch(`/api/admin/analytics/user-activity?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setUserActivity(data)
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
      } finally {
        setIsLoadingActivity(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserActivity()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch activity log when analytics tab is active
  useEffect(() => {
    const fetchActivityLog = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'internal') return
      
      setIsLoadingActivityLog(true)
      try {
        const response = await fetch(`/api/admin/analytics/activity-log?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setActivityLog(data)
        }
      } catch (error) {
        console.error('Error fetching activity log:', error)
      } finally {
        setIsLoadingActivityLog(false)
      }
    }

    if (status === 'authenticated') {
      fetchActivityLog()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch sales performance when analytics tab is active
  useEffect(() => {
    const fetchSalesPerformance = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'internal') return
      
      setIsLoadingSalesPerformance(true)
      try {
        const response = await fetch(`/api/admin/analytics/sales-performance?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setSalesPerformance(data)
        }
      } catch (error) {
        console.error('Error fetching sales performance:', error)
      } finally {
        setIsLoadingSalesPerformance(false)
      }
    }

    if (status === 'authenticated') {
      fetchSalesPerformance()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch system health when analytics tab is active
  useEffect(() => {
    const fetchSystemHealth = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'internal') return
      
      setIsLoadingSystemHealth(true)
      try {
        const response = await fetch(`/api/admin/analytics/system-health?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setSystemHealth(data)
        }
      } catch (error) {
        console.error('Error fetching system health:', error)
      } finally {
        setIsLoadingSystemHealth(false)
      }
    }

    if (status === 'authenticated') {
      fetchSystemHealth()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch chatbot performance when external analytics tab is active
  useEffect(() => {
    const fetchChatbotPerformance = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'external') return
      
      setIsLoadingChatbotPerformance(true)
      try {
        const response = await fetch(`/api/admin/analytics/chatbot-performance?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setChatbotPerformance(data)
        }
      } catch (error) {
        console.error('Error fetching chatbot performance:', error)
      } finally {
        setIsLoadingChatbotPerformance(false)
      }
    }

    if (status === 'authenticated') {
      fetchChatbotPerformance()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch restaurant health when external analytics tab is active
  useEffect(() => {
    const fetchRestaurantHealth = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'external') return
      
      setIsLoadingRestaurantHealth(true)
      try {
        const response = await fetch(`/api/admin/analytics/restaurant-health?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurantHealth(data)
        }
      } catch (error) {
        console.error('Error fetching restaurant health:', error)
      } finally {
        setIsLoadingRestaurantHealth(false)
      }
    }

    if (status === 'authenticated') {
      fetchRestaurantHealth()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])

  // Fetch usage patterns when external analytics tab is active
  useEffect(() => {
    const fetchUsagePatterns = async () => {
      if (activeTab !== 'analytics' || analyticsSubTab !== 'external') return
      
      setIsLoadingUsagePatterns(true)
      try {
        const response = await fetch(`/api/admin/analytics/usage-patterns?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setUsagePatterns(data)
        }
      } catch (error) {
        console.error('Error fetching usage patterns:', error)
      } finally {
        setIsLoadingUsagePatterns(false)
      }
    }

    if (status === 'authenticated') {
      fetchUsagePatterns()
    }
  }, [status, activeTab, analyticsSubTab, timeRange])
  
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

  const handleSendInvite = async () => {
    if (!userForm.name || !userForm.email) {
      setUserMessage('Please fill in all required fields')
      return
    }

    setIsCreatingUser(true)
    setUserMessage('')

    try {
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUserMessage(data.error || 'Failed to send invite')
        setIsCreatingUser(false)
        return
      }

      setUserMessage(`Invite sent to ${userForm.email}!`)
      setUserForm({
        name: '',
        email: '',
        role: 'restaurant',
      })

      setTimeout(() => {
        setShowCreateUserModal(false)
        setUserMessage('')
      }, 2000)
    } catch (error) {
      setUserMessage('Failed to send invite. Please try again.')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/marketing' })
  }

  // Restaurant management functions
  const handleRestaurantPause = async (restaurantId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/restaurants/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, isActive })
      })
      
      if (response.ok) {
        const restaurantsResponse = await fetch(`/api/restaurants`)
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json()
          setRestaurants(restaurantsData)
        }
      }
    } catch (error) {
      console.error('Error pausing restaurant:', error)
    }
  }

  const handleToggleOnboarded = async (restaurantId: string, currentOnboardedStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/restaurants/toggle-onboarded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, isOnboarded: !currentOnboardedStatus })
      })
      
      if (response.ok) {
        const restaurantsResponse = await fetch(`/api/restaurants`)
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json()
          setRestaurants(restaurantsData)
        }
      }
    } catch (error) {
      console.error('Error toggling onboarding status:', error)
    }
  }

  const handleRestaurantDelete = async (restaurantId: string) => {
    try {
      const response = await fetch('/api/admin/restaurants/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      })
      
      if (response.ok) {
        const restaurantsResponse = await fetch(`/api/restaurants`)
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json()
          setRestaurants(restaurantsData)
        }
        setConfirmAction(null)
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error)
    }
  }

  // User management functions
  const handleUserPause = async (email: string, status: string) => {
    try {
      const response = await fetch('/api/admin/users/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status })
      })
      
      if (response.ok) {
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setAllUsers(usersData)
        }
        setConfirmAction(null)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleUserDelete = async (email: string) => {
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setAllUsers(usersData)
        }
        setConfirmAction(null)
      } else {
        const data = await response.json()
        console.error('Delete failed:', data.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
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
                <span className="text-xl font-bold text-gray-900">Front of House AI</span>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    Admin Dashboard
                  </h1>
                  <p className="text-blue-100 mt-2">
                    Manage users and system administration
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('owners')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'owners'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Restaurant Account Managers ({allUsers.filter(u => u.role === 'restaurant').length})
                </button>
                <button
                  onClick={() => setActiveTab('sales-reps')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'sales-reps'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Sales Reps ({allUsers.filter(u => u.role === 'sales_rep').length})
                </button>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'restaurants'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Restaurants ({restaurants.length})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'analytics'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              </nav>
            </div>

            <div className="p-6 space-y-8">
              {/* Create User and Create Demo Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Invite User
                </button>
                <button
                  onClick={() => router.push('/manual-input?admin=true')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Demo
                </button>
              </div>
                  
              {/* Tab Content */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
              ) : (
                <>
                  {/* Restaurant Account Managers Tab */}
                  {activeTab === 'owners' && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">Restaurant Account Managers</h2>
                      <p className="text-sm text-gray-500">Account managers who own restaurant dashboards. Deleting an account manager is permanent and does not delete their restaurants.</p>
                      <div className="grid gap-4">
                        {allUsers.filter(u => u.role === 'restaurant').map((user) => (
                          <div
                            key={user.email}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/restaurants?owner_email=${encodeURIComponent(user.email)}`)
                                        if (res.ok) {
                                          const restaurants = await res.json()
                                          if (restaurants && restaurants.length > 0 && restaurants[0].widget_id) {
                                            router.push(`/admin/restaurant/${restaurants[0].widget_id}/dashboard`)
                                          } else {
                                            router.push(`/admin/user/${encodeURIComponent(user.email)}?role=restaurant`)
                                          }
                                        } else {
                                          router.push(`/admin/user/${encodeURIComponent(user.email)}?role=restaurant`)
                                        }
                                      } catch (err) {
                                        console.error('Error fetching restaurant:', err)
                                        router.push(`/admin/user/${encodeURIComponent(user.email)}?role=restaurant`)
                                      }
                                    }}
                                    className={`font-semibold hover:text-primary-600 transition-colors text-left ${
                                      user.status === 'deleted' ? 'text-red-600' : 'text-gray-900'
                                    }`}
                                  >
                                    {user.name}
                                  </button>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                  </p>
                                  {user.restaurantName && (
                                    <span className="text-xs text-gray-500 mt-1 block">{user.restaurantName}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Status</p>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    user.status === 'deleted' ? 'bg-red-100 text-red-800' :
                                    user.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {user.status === 'deleted' ? 'Deleted' : user.status === 'paused' ? 'Paused' : 'Active'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {user.status !== 'paused' && user.status !== 'deleted' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setConfirmAction({
                                          type: 'pause-user',
                                          item: user,
                                          message: `Pause ${user.name}? They will not be able to log in.`
                                        })
                                      }}
                                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                      title="Pause account manager"
                                    >
                                      <Pause className="w-4 h-4" />
                                    </button>
                                  )}
                                  {user.status === 'paused' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setConfirmAction({
                                          type: 'unpause-user',
                                          item: user,
                                          message: `Activate ${user.name}? They will be able to log in again.`
                                        })
                                      }}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Activate account manager"
                                    >
                                      <Play className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setConfirmAction({
                                        type: 'delete-user',
                                        item: user,
                                        message: `Permanently delete ${user.name}? This cannot be undone. Their restaurants will remain. You can re-invite this email later.`
                                      })
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Permanently delete account manager"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {allUsers.filter(u => u.role === 'restaurant').length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No restaurant account managers found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sales Reps Tab */}
                  {activeTab === 'sales-reps' && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">Sales Representatives</h2>
                      <div className="grid gap-4">
                        {allUsers.filter(u => u.role === 'sales_rep').map((user) => (
                          <div
                            key={user.email}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                                <div className="flex-1">
                                  <button
                                    onClick={() => router.push(`/admin/user/${encodeURIComponent(user.email)}?role=sales_rep`)}
                                    className={`font-semibold hover:text-blue-600 transition-colors text-left ${
                                      user.status === 'deleted' ? 'text-red-600' : 'text-gray-900'
                                    }`}
                                  >
                                    {user.name}
                                  </button>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                  </p>
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Sales Rep
                                  </span>
                  </div>
                </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Status</p>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    user.status === 'deleted'
                                      ? 'bg-red-100 text-red-800'
                                      : user.status === 'paused'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {user.status === 'deleted' ? 'Deleted' : user.status === 'paused' ? 'Paused' : 'Active'}
                                  </span>
              </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Created</p>
                                  <p className="text-sm text-gray-700">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {user.status !== 'paused' && user.status !== 'deleted' && (
                  <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setConfirmAction({
                                          type: 'pause-user',
                                          item: user,
                                          message: `Are you sure you want to pause ${user.name}? They will not be able to log in.`
                                        })
                                      }}
                                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                      title="Pause user"
                  >
                                      <Pause className="w-4 h-4" />
                  </button>
                                  )}
                                  {user.status === 'paused' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setConfirmAction({
                                          type: 'unpause-user',
                                          item: user,
                                          message: `Are you sure you want to activate ${user.name}? They will be able to log in again.`
                                        })
                                      }}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Activate user"
                                    >
                                      <Play className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setConfirmAction({
                                        type: 'delete-user',
                                        item: user,
                                        message: `Permanently delete ${user.name}? This cannot be undone. You can re-invite this email afterwards.`
                                      })
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Permanently delete user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {allUsers.filter(u => u.role === 'sales_rep').length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No sales representatives found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Restaurants Tab */}
                  {activeTab === 'restaurants' && (
                <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">Restaurants</h2>
                      <p className="text-sm text-gray-500">Deleting a restaurant is permanent. It does not delete the account manager.</p>
                      <div className="grid gap-4">
                        {restaurants.map((restaurant) => (
                          <div
                            key={restaurant.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              console.log('Restaurant clicked:', restaurant)
                              if (restaurant.widget_id) {
                                const url = `/admin/restaurant/${restaurant.widget_id}/dashboard`
                                console.log('Navigating to:', url)
                                router.push(url)
                              } else {
                                console.error('Restaurant widget_id is missing:', restaurant)
                                alert('Restaurant widget ID not found. Please refresh the page.')
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log('Restaurant name clicked:', restaurant)
                                      if (restaurant.widget_id) {
                                        const url = `/admin/restaurant/${restaurant.widget_id}/dashboard`
                                        console.log('Navigating to:', url)
                                        router.push(url)
                                      } else {
                                        console.error('Restaurant widget_id is missing:', restaurant)
                                        alert('Restaurant widget ID not found. Please refresh the page.')
                                      }
                                    }}
                                    className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-left"
                                  >
                                    {restaurant.name}
                                  </button>
                                  {restaurant.description && (
                                    <p className="text-sm text-gray-500 line-clamp-1">{restaurant.description}</p>
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
                                    {restaurant.is_active ? (
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
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Created</p>
                                  <p className="text-sm text-gray-700">
                                    {restaurant.created_at ? new Date(restaurant.created_at).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {restaurant.is_active ? (
                          <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setConfirmAction({
                                              type: 'pause-restaurant',
                                              item: restaurant,
                                              message: `Are you sure you want to pause ${restaurant.name}? The chatbot will be removed from their website.`
                                            })
                                          }}
                                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                          title="Pause restaurant"
                          >
                                          <Pause className="w-4 h-4" />
                          </button>
                                      ) : (
                          <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setConfirmAction({
                                              type: 'unpause-restaurant',
                                              item: restaurant,
                                              message: `Are you sure you want to activate ${restaurant.name}? The chatbot will be restored on their website.`
                                            })
                                          }}
                                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Activate restaurant"
                          >
                                          <Play className="w-4 h-4" />
                          </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleToggleOnboarded(restaurant.id, restaurant.is_onboarded)
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${
                                          restaurant.is_onboarded
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-red-500 hover:bg-red-50'
                                        }`}
                                        title={restaurant.is_onboarded ? 'Mark as demo (un-onboard)' : 'Mark as onboarded'}
                                      >
                                        {restaurant.is_onboarded ? (
                                          <CheckCircle className="w-4 h-4" />
                                        ) : (
                                          <XCircle className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setConfirmAction({
                                            type: 'delete-restaurant',
                                            item: restaurant,
                                            message: `Permanently delete ${restaurant.name}? This cannot be undone. All menu data and chatbot settings will be removed. The account manager will not be deleted.`
                                          })
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete restaurant"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                </div>
                        </div>
                      </div>
                    </div>
                  ))}
                        {restaurants.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No restaurants found</p>
                    </div>
                  )}
                </div>
              </div>
                  )}

                  {/* Analytics Tab */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      {/* Sub-tabs for Internal/External */}
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                          <button
                            onClick={() => setAnalyticsSubTab('internal')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                              analyticsSubTab === 'internal'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Activity className="w-4 h-4" />
                            Internal Analytics
                          </button>
                          <button
                            onClick={() => setAnalyticsSubTab('external')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                              analyticsSubTab === 'external'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            External Analytics
                          </button>
                        </nav>
                      </div>

                      {/* Internal Analytics Content */}
                      {analyticsSubTab === 'internal' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-900">Internal Analytics</h2>
                            <div className="flex items-center gap-3">
                              <label className="text-sm text-gray-600">Time Range:</label>
                              <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                              >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                                <option value="all">All time</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Summary Cards */}
                          {userActivity?.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Active Users</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                      {userActivity.summary.totalActiveUsers}
                                    </p>
                                  </div>
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-green-600" />
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Logins ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                      {userActivity.summary.totalLoginsLast30Days}
                                    </p>
                                  </div>
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Unique Users ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                      {userActivity.summary.uniqueUsersLast30Days}
                                    </p>
                                  </div>
                                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Currently Active Users */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-green-600" />
                              Currently Active Users
                            </h3>
                            {isLoadingActivity ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : userActivity?.activeSessions && userActivity.activeSessions.length > 0 ? (
                              <div className="space-y-3">
                                {userActivity.activeSessions.map((session: any, idx: number) => (
                                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                          <User className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">{session.user_email}</p>
                                          <p className="text-sm text-gray-500">
                                            {session.session_type === 'admin' ? 'Admin' : 
                                             session.session_type === 'sales_rep' ? 'Sales Rep' : 
                                             session.session_type === 'owner' ? 'Restaurant Account Manager' : 'User'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-600">Last Active</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {new Date(session.last_active).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No active users</p>
                            )}
                          </div>

                          {/* User Activity Stats */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              User Activity Stats ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingActivity ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : userActivity?.userStats && userActivity.userStats.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Logins</th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Login</th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Session</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userActivity.userStats.map((stat: any, idx: number) => (
                                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                          <p className="font-medium text-gray-900">{stat.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                          {stat.isActive ? (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                              Active
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                              Offline
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">{stat.totalLogins}</td>
                                        <td className="py-3 px-4 text-gray-900">
                                          {stat.lastLogin ? new Date(stat.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900">
                                          {stat.averageSessionTime > 0 ? `${stat.averageSessionTime} min` : 'N/A'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No activity data available</p>
                            )}
                          </div>

                          {/* Sales Performance */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              Sales Performance ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingSalesPerformance ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : salesPerformance?.summary ? (
                              <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Sales Reps</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {salesPerformance.summary.totalSalesReps}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Demos</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {salesPerformance.summary.totalDemos}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Onboarded</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {salesPerformance.summary.totalOnboarded}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {salesPerformance.summary.overallConversionRate}%
                                    </p>
                                  </div>
                                </div>

                                {/* Sales Rep Performance Table */}
                                {salesPerformance.salesRepStats && salesPerformance.salesRepStats.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-gray-200">
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sales Rep</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Demos</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Onboarded</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Conversion Rate</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last 30 Days</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {salesPerformance.salesRepStats.map((rep: any, idx: number) => (
                                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                              <p className="font-medium text-gray-900">{rep.name}</p>
                                              <p className="text-xs text-gray-500">{rep.email}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-900">{rep.totalDemos}</td>
                                            <td className="py-3 px-4 text-gray-900">{rep.onboardedRestaurants}</td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                rep.conversionRate >= 50 
                                                  ? 'bg-green-100 text-green-800'
                                                  : rep.conversionRate >= 25
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {rep.conversionRate}%
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-900">
                                              <span className="text-sm">{rep.demosLast30Days} demos</span>
                                              {rep.onboardedLast30Days > 0 && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                  ({rep.onboardedLast30Days} onboarded)
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-center py-8">No sales performance data available</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No sales performance data available</p>
                            )}
                          </div>

                          {/* Activity Log */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-purple-600" />
                              Activity Log ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingActivityLog ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : activityLog?.activities && activityLog.activities.length > 0 ? (
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {activityLog.activities.map((activity: any, idx: number) => (
                                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            activity.user_role === 'admin' 
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : activity.user_role === 'sales_rep'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-green-100 text-green-800'
                                          }`}>
                                            {activity.user_role === 'admin' ? 'Admin' : 
                                             activity.user_role === 'sales_rep' ? 'Sales Rep' : 
                                             'Account Manager'}
                                          </span>
                                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {activity.action_type.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium">
                                          {activity.user_email}
                                        </p>
                                        {activity.restaurant_name && (
                                          <p className="text-sm text-gray-600">
                                            Restaurant: {activity.restaurant_name}
                                          </p>
                                        )}
                                        {activity.details && Object.keys(activity.details).length > 0 && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {JSON.stringify(activity.details)}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                          {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No activity log entries</p>
                            )}
                          </div>

                          {/* System Health */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Server className="w-5 h-5 text-blue-600" />
                              System Health ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingSystemHealth ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : systemHealth?.systemHealth ? (
                              <div className="space-y-6">
                                {/* Overall Health Status */}
                                <div className={`rounded-lg p-6 ${
                                  systemHealth.systemHealth.overallStatus === 'healthy'
                                    ? 'bg-green-50 border-2 border-green-200'
                                    : systemHealth.systemHealth.overallStatus === 'degraded'
                                    ? 'bg-yellow-50 border-2 border-yellow-200'
                                    : 'bg-red-50 border-2 border-red-200'
                                }`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                        Overall System Status: {systemHealth.systemHealth.overallStatus === 'healthy' ? 'Healthy' : 
                                         systemHealth.systemHealth.overallStatus === 'degraded' ? 'Degraded' : 'Critical'}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Health Score: {systemHealth.systemHealth.healthScore}/100
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                                        systemHealth.systemHealth.overallStatus === 'healthy'
                                          ? 'bg-green-200 text-green-800'
                                          : systemHealth.systemHealth.overallStatus === 'degraded'
                                          ? 'bg-yellow-200 text-yellow-800'
                                          : 'bg-red-200 text-red-800'
                                      }`}>
                                        {systemHealth.systemHealth.healthScore}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Score Breakdown */}
                                  {systemHealth.systemHealth.scoreBreakdown && (
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h5>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-gray-600">Starting Score:</span>
                                          <span className="font-medium text-gray-900">100</span>
                                        </div>
                                        {systemHealth.systemHealth.scoreBreakdown.penalties && systemHealth.systemHealth.scoreBreakdown.penalties.length > 0 ? (
                                          <>
                                            {systemHealth.systemHealth.scoreBreakdown.penalties.map((penalty: any, idx: number) => (
                                              <div key={idx} className="flex items-start justify-between text-sm">
                                                <div className="flex-1">
                                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                                    penalty.severity === 'critical' ? 'bg-red-500' :
                                                    penalty.severity === 'warning' ? 'bg-yellow-500' : 'bg-orange-400'
                                                  }`}></span>
                                                  <span className="text-gray-700">{penalty.reason}</span>
                                                </div>
                                                <span className={`font-medium ml-2 ${
                                                  penalty.severity === 'critical' ? 'text-red-600' :
                                                  penalty.severity === 'warning' ? 'text-yellow-600' : 'text-orange-600'
                                                }`}>
                                                  {penalty.points}
                                                </span>
                                              </div>
                                            ))}
                                            <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                                              <span className="text-gray-900">Final Score:</span>
                                              <span className={`${
                                                systemHealth.systemHealth.healthScore >= 80 ? 'text-green-600' :
                                                systemHealth.systemHealth.healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                              }`}>
                                                {systemHealth.systemHealth.scoreBreakdown.finalScore}
                                              </span>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="text-sm text-green-600 font-medium">
                                            ✓ No penalties - System is operating optimally
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Database Health */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Database Health</h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className={`text-sm font-medium ${
                                          systemHealth.systemHealth.dbHealth.status === 'healthy'
                                            ? 'text-green-600'
                                            : systemHealth.systemHealth.dbHealth.status === 'degraded'
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                        }`}>
                                          {systemHealth.systemHealth.dbHealth.status === 'healthy' ? 'Healthy' :
                                           systemHealth.systemHealth.dbHealth.status === 'degraded' ? 'Degraded' : 'Down'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Response Time:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {systemHealth.systemHealth.dbHealth.responseTime}ms
                                        </span>
                                      </div>
                                      {systemHealth.systemHealth.dbHealth.error && (
                                        <div className="text-xs text-red-600 mt-1">
                                          Error: {systemHealth.systemHealth.dbHealth.error}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* API Metrics */}
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">API Metrics</h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Requests:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {systemHealth.systemHealth.apiMetrics.totalRequests.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Response Time:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {systemHealth.systemHealth.apiMetrics.avgResponseTime}ms
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Error Rate:</span>
                                        <span className={`text-sm font-medium ${
                                          systemHealth.systemHealth.apiMetrics.errorRate > 5
                                            ? 'text-red-600'
                                            : systemHealth.systemHealth.apiMetrics.errorRate > 1
                                            ? 'text-yellow-600'
                                            : 'text-green-600'
                                        }`}>
                                          {systemHealth.systemHealth.apiMetrics.errorRate}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Active Sessions:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {systemHealth.systemHealth.apiMetrics.activeSessions}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Activity Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Activity</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {systemHealth.systemHealth.activityMetrics.totalActivity.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Logins</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {systemHealth.systemHealth.activityMetrics.totalLogins.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">System Uptime</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {systemHealth.systemHealth.activityMetrics.systemUptimeDays} days
                                    </p>
                                  </div>
                                </div>

                                {/* Top API Endpoints */}
                                {systemHealth.systemHealth.topEndpoints && systemHealth.systemHealth.topEndpoints.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Top API Endpoints</h5>
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Endpoint</th>
                                            <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Requests</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {systemHealth.systemHealth.topEndpoints.map((endpoint: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100">
                                              <td className="py-2 px-4 text-sm text-gray-900">
                                                {endpoint.endpoint.replace(/_/g, ' ')}
                                              </td>
                                              <td className="py-2 px-4 text-sm text-gray-900 text-right">
                                                {endpoint.count.toLocaleString()}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Recent Errors */}
                                {systemHealth.systemHealth.recentErrors && systemHealth.systemHealth.recentErrors.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-red-700 mb-3">Recent Errors</h5>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {systemHealth.systemHealth.recentErrors.map((error: any, idx: number) => (
                                        <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-red-900">
                                                {error.action_type.replace(/_/g, ' ')}
                                              </p>
                                              <p className="text-xs text-red-700 mt-1">
                                                {error.user_email}
                                              </p>
                                              {error.details && (
                                                <p className="text-xs text-red-600 mt-1">
                                                  {typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}
                                                </p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <p className="text-xs text-red-600">
                                                {new Date(error.timestamp).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No system health data available</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* External Analytics Content */}
                      {analyticsSubTab === 'external' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-900">External Analytics</h2>
                            <div className="flex items-center gap-3">
                              <label className="text-sm text-gray-600">Time Range:</label>
                              <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                              >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                                <option value="all">All time</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Chatbot Performance */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-blue-600" />
                              Chatbot Performance ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingChatbotPerformance ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : chatbotPerformance?.summary ? (
                              <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Messages</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {chatbotPerformance.summary.totalMessages}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Conversations</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {chatbotPerformance.summary.totalConversations}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Avg Response Time</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {chatbotPerformance.summary.avgResponseTime}ms
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Active Restaurants</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {chatbotPerformance.summary.totalRestaurants}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Satisfaction Rate</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                      {chatbotPerformance.summary.overallSatisfactionRate || 0}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {chatbotPerformance.summary.totalFeedback || 0} feedback
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Positive Feedback</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                      {chatbotPerformance.summary.totalPositiveFeedback || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {chatbotPerformance.summary.totalNegativeFeedback || 0} negative
                                    </p>
                                  </div>
                                </div>

                                {/* Restaurant Performance Table */}
                                {chatbotPerformance.restaurantStats && chatbotPerformance.restaurantStats.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-gray-200">
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Restaurant</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Messages</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Conversations</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Response</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completion Rate</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Satisfaction</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Feedback</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Popular Items</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {chatbotPerformance.restaurantStats.map((stat: any, idx: number) => (
                                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                              <p className="font-medium text-gray-900">{stat.restaurant_name}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-900">{stat.totalMessages}</td>
                                            <td className="py-3 px-4 text-gray-900">{stat.totalConversations}</td>
                                            <td className="py-3 px-4 text-gray-900">
                                              {stat.avgResponseTime > 0 ? `${stat.avgResponseTime}ms` : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                stat.conversationCompletionRate >= 50 
                                                  ? 'bg-green-100 text-green-800'
                                                  : stat.conversationCompletionRate >= 25
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {stat.conversationCompletionRate}%
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              {stat.totalFeedback > 0 ? (
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  stat.satisfactionRate >= 80
                                                    ? 'bg-green-100 text-green-800'
                                                    : stat.satisfactionRate >= 60
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                  {stat.satisfactionRate}%
                                                </span>
                                              ) : (
                                                <span className="text-xs text-gray-400">No feedback</span>
                                              )}
                                            </td>
                                            <td className="py-3 px-4">
                                              {stat.totalFeedback > 0 ? (
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs text-green-600 font-medium">
                                                    👍 {stat.positiveFeedback}
                                                  </span>
                                                  <span className="text-xs text-red-600 font-medium">
                                                    👎 {stat.negativeFeedback}
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                              )}
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="flex flex-wrap gap-1">
                                                {Object.keys(stat.popularMenuItems).slice(0, 3).map((item: string) => (
                                                  <span key={item} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                    {item}
                                                  </span>
                                                ))}
                                                {Object.keys(stat.popularMenuItems).length === 0 && (
                                                  <span className="text-xs text-gray-400">None</span>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-center py-8">No chatbot performance data available</p>
                                )}

                                {/* Feedback Analytics */}
                                {chatbotPerformance.restaurantStats && chatbotPerformance.restaurantStats.length > 0 && (
                                  <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Feedback Analytics</h4>
                                    
                                    {/* Restaurants Needing Attention (Low Satisfaction) */}
                                    {chatbotPerformance.restaurantStats.filter((stat: any) => 
                                      stat.totalFeedback > 0 && stat.satisfactionRate < 60
                                    ).length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-sm font-semibold text-red-700 mb-3">⚠️ Restaurants Needing Attention</h5>
                                        <div className="bg-red-50 rounded-lg p-4 space-y-2">
                                          {chatbotPerformance.restaurantStats
                                            .filter((stat: any) => stat.totalFeedback > 0 && stat.satisfactionRate < 60)
                                            .sort((a: any, b: any) => a.satisfactionRate - b.satisfactionRate)
                                            .slice(0, 5)
                                            .map((stat: any, idx: number) => (
                                              <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900">{stat.restaurant_name}</span>
                                                <div className="flex items-center gap-4">
                                                  <span className="text-red-600 font-medium">{stat.satisfactionRate}% satisfaction</span>
                                                  <span className="text-gray-600">
                                                    {stat.positiveFeedback}👍 / {stat.negativeFeedback}👎
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Top Performing Restaurants (High Satisfaction) */}
                                    {chatbotPerformance.restaurantStats.filter((stat: any) => 
                                      stat.totalFeedback >= 5 && stat.satisfactionRate >= 80
                                    ).length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-sm font-semibold text-green-700 mb-3">⭐ Top Performing Restaurants</h5>
                                        <div className="bg-green-50 rounded-lg p-4 space-y-2">
                                          {chatbotPerformance.restaurantStats
                                            .filter((stat: any) => stat.totalFeedback >= 5 && stat.satisfactionRate >= 80)
                                            .sort((a: any, b: any) => b.satisfactionRate - a.satisfactionRate)
                                            .slice(0, 5)
                                            .map((stat: any, idx: number) => (
                                              <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900">{stat.restaurant_name}</span>
                                                <div className="flex items-center gap-4">
                                                  <span className="text-green-600 font-medium">{stat.satisfactionRate}% satisfaction</span>
                                                  <span className="text-gray-600">
                                                    {stat.positiveFeedback}👍 / {stat.negativeFeedback}👎
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Feedback Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Total Feedback</p>
                                        <p className="text-2xl font-bold text-blue-700 mt-1">
                                          {chatbotPerformance.summary.totalFeedback || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {chatbotPerformance.summary.totalMessages > 0
                                            ? Math.round(((chatbotPerformance.summary.totalFeedback || 0) / chatbotPerformance.summary.totalMessages) * 100)
                                            : 0}% feedback rate
                                        </p>
                                      </div>
                                      <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Positive Feedback</p>
                                        <p className="text-2xl font-bold text-green-700 mt-1">
                                          {chatbotPerformance.summary.totalPositiveFeedback || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {chatbotPerformance.summary.totalFeedback > 0
                                            ? Math.round(((chatbotPerformance.summary.totalPositiveFeedback || 0) / chatbotPerformance.summary.totalFeedback) * 100)
                                            : 0}% of feedback
                                        </p>
                                      </div>
                                      <div className="bg-red-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Negative Feedback</p>
                                        <p className="text-2xl font-bold text-red-700 mt-1">
                                          {chatbotPerformance.summary.totalNegativeFeedback || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {chatbotPerformance.summary.totalFeedback > 0
                                            ? Math.round(((chatbotPerformance.summary.totalNegativeFeedback || 0) / chatbotPerformance.summary.totalFeedback) * 100)
                                            : 0}% of feedback
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No chatbot performance data available</p>
                            )}
                          </div>

                          {/* Usage Patterns */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-purple-600" />
                              Usage Patterns ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingUsagePatterns ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : usagePatterns?.usagePatterns ? (
                              <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Messages</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {usagePatterns.summary.totalMessages.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Peak Hour</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                      {usagePatterns.summary.peakHour}:00
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {usagePatterns.usagePatterns.hourlyPatterns.find((h: any) => h.hour === usagePatterns.summary.peakHour)?.count || 0} messages
                                    </p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Peak Day</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                      {usagePatterns.summary.peakDayName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {usagePatterns.usagePatterns.dailyPatterns.find((d: any) => d.dayName === usagePatterns.summary.peakDayName)?.count || 0} messages
                                    </p>
                                  </div>
                                  <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Avg Messages/Day</p>
                                    <p className="text-2xl font-bold text-purple-700 mt-1">
                                      {usagePatterns.summary.avgMessagesPerDay}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {usagePatterns.summary.uniqueIPs} unique IPs
                                    </p>
                                  </div>
                                </div>

                                {/* Hourly Patterns */}
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Hourly Usage Pattern</h5>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-12 gap-1">
                                      {usagePatterns.usagePatterns.hourlyPatterns.map((hour: any) => {
                                        const maxCount = Math.max(...usagePatterns.usagePatterns.hourlyPatterns.map((h: any) => h.count))
                                        const heightPercent = maxCount > 0 ? (hour.count / maxCount) * 100 : 0
                                        return (
                                          <div key={hour.hour} className="flex flex-col items-center">
                                            <div className="w-full bg-gray-200 rounded-t" style={{ height: '100px', position: 'relative' }}>
                                              <div 
                                                className={`w-full rounded-t transition-all ${
                                                  hour.hour === usagePatterns.summary.peakHour
                                                    ? 'bg-blue-600'
                                                    : 'bg-blue-400'
                                                }`}
                                                style={{ 
                                                  height: `${heightPercent}%`,
                                                  position: 'absolute',
                                                  bottom: 0
                                                }}
                                              ></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{hour.hour}</p>
                                            <p className="text-xs font-medium text-gray-900">{hour.count}</p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Daily Patterns */}
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Daily Usage Pattern</h5>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                      {usagePatterns.usagePatterns.dailyPatterns.map((day: any) => {
                                        const maxCount = Math.max(...usagePatterns.usagePatterns.dailyPatterns.map((d: any) => d.count))
                                        const widthPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                                        return (
                                          <div key={day.day} className="flex items-center gap-3">
                                            <div className="w-24 text-sm font-medium text-gray-700">
                                              {day.dayName}
                                            </div>
                                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                              <div 
                                                className={`h-6 rounded-full transition-all ${
                                                  day.dayName === usagePatterns.summary.peakDayName
                                                    ? 'bg-green-600'
                                                    : 'bg-green-400'
                                                }`}
                                                style={{ width: `${widthPercent}%` }}
                                              ></div>
                                            </div>
                                            <div className="w-16 text-sm text-gray-900 font-medium text-right">
                                              {day.count}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Most Common Questions */}
                                {usagePatterns.usagePatterns.topQuestions && usagePatterns.usagePatterns.topQuestions.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Most Common Questions/Topics</h5>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {usagePatterns.usagePatterns.topQuestions.slice(0, 10).map((question: any, idx: number) => (
                                          <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                  {question.examples && question.examples.length > 0 
                                                    ? question.examples[0]
                                                    : question.pattern}
                                                </p>
                                                {question.examples && question.examples.length > 1 && (
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    Similar: {question.examples.slice(1, 2).join(', ')}
                                                  </p>
                                                )}
                                              </div>
                                              <div className="ml-4 text-right">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                  {question.count}x
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Device & Browser Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Device Breakdown */}
                                  {usagePatterns.usagePatterns.deviceBreakdown && usagePatterns.usagePatterns.deviceBreakdown.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Smartphone className="w-4 h-4" />
                                        Device Breakdown
                                      </h5>
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-3">
                                          {usagePatterns.usagePatterns.deviceBreakdown.map((device: any, idx: number) => {
                                            const total = usagePatterns.usagePatterns.deviceBreakdown.reduce((sum: number, d: any) => sum + d.count, 0)
                                            const percent = total > 0 ? Math.round((device.count / total) * 100) : 0
                                            return (
                                              <div key={idx} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">{device.device}</span>
                                                <div className="flex items-center gap-3">
                                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                      className="bg-blue-600 h-2 rounded-full"
                                                      style={{ width: `${percent}%` }}
                                                    ></div>
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                                    {device.count} ({percent}%)
                                                  </span>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Browser Breakdown */}
                                  {usagePatterns.usagePatterns.browserBreakdown && usagePatterns.usagePatterns.browserBreakdown.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Monitor className="w-4 h-4" />
                                        Browser Breakdown
                                      </h5>
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-3">
                                          {usagePatterns.usagePatterns.browserBreakdown.map((browser: any, idx: number) => {
                                            const total = usagePatterns.usagePatterns.browserBreakdown.reduce((sum: number, b: any) => sum + b.count, 0)
                                            const percent = total > 0 ? Math.round((browser.count / total) * 100) : 0
                                            return (
                                              <div key={idx} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">{browser.browser}</span>
                                                <div className="flex items-center gap-3">
                                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                      className="bg-green-600 h-2 rounded-full"
                                                      style={{ width: `${percent}%` }}
                                                    ></div>
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                                    {browser.count} ({percent}%)
                                                  </span>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Usage Trends Over Time */}
                                {usagePatterns.usagePatterns.dailyTrends && usagePatterns.usagePatterns.dailyTrends.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      Usage Trends Over Time
                                    </h5>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {usagePatterns.usagePatterns.dailyTrends.map((trend: any, idx: number) => {
                                          const maxCount = Math.max(...usagePatterns.usagePatterns.dailyTrends.map((t: any) => t.count))
                                          const widthPercent = maxCount > 0 ? (trend.count / maxCount) * 100 : 0
                                          return (
                                            <div key={idx} className="flex items-center gap-3">
                                              <div className="w-24 text-xs text-gray-600">
                                                {trend.formattedDate}
                                              </div>
                                              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                                <div 
                                                  className="bg-purple-600 h-4 rounded-full transition-all"
                                                  style={{ width: `${widthPercent}%` }}
                                                ></div>
                                              </div>
                                              <div className="w-12 text-xs text-gray-900 font-medium text-right">
                                                {trend.count}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No usage pattern data available</p>
                            )}
                          </div>

                          {/* Restaurant Health */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-green-600" />
                              Restaurant Health ({timeRange === 'all' ? 'All time' : `Last ${timeRange} days`})
                            </h3>
                            {isLoadingRestaurantHealth ? (
                              <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : restaurantHealth?.summary ? (
                              <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Restaurants</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {restaurantHealth.summary.total_restaurants}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Healthy</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                      {restaurantHealth.summary.healthy_count}
                                    </p>
                                  </div>
                                  <div className="bg-yellow-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Needs Attention</p>
                                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                                      {restaurantHealth.summary.needs_attention_count}
                                    </p>
                                  </div>
                                  <div className="bg-red-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Critical</p>
                                    <p className="text-2xl font-bold text-red-700 mt-1">
                                      {restaurantHealth.summary.critical_count}
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Avg Health Score</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                      {restaurantHealth.summary.avg_health_score}
                                    </p>
                                  </div>
                                </div>

                                {/* Restaurant Health Table */}
                                {restaurantHealth.restaurantHealth && restaurantHealth.restaurantHealth.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-gray-200">
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Restaurant</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Health Score</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completeness</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Engagement</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sessions</th>
                                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recommendations</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {restaurantHealth.restaurantHealth.map((restaurant: any, idx: number) => (
                                          <tr 
                                            key={idx} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/admin/restaurant/${restaurant.widget_id}/dashboard`)}
                                          >
                                            <td className="py-3 px-4">
                                              <div>
                                                <p className="font-medium text-gray-900">{restaurant.restaurant_name}</p>
                                                <p className="text-xs text-gray-500">{restaurant.widget_id}</p>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                restaurant.health_status === 'healthy'
                                                  ? 'bg-green-100 text-green-800'
                                                  : restaurant.health_status === 'needs_attention'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {restaurant.health_status === 'healthy' ? 'Healthy' : 
                                                 restaurant.health_status === 'needs_attention' ? 'Needs Attention' : 'Critical'}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className={`h-2 rounded-full ${
                                                      restaurant.overall_health_score >= 70 ? 'bg-green-600' :
                                                      restaurant.overall_health_score >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}
                                                    style={{ width: `${restaurant.overall_health_score}%` }}
                                                  ></div>
                                                </div>
                                                <span 
                                                  className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 hover:underline transition-colors"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRestaurantBreakdown(restaurant)
                                                  }}
                                                >
                                                  {restaurant.overall_health_score}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="text-sm text-gray-900">{restaurant.completeness_score}%</span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="text-sm text-gray-900">{restaurant.engagement_score}%</span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="text-sm">
                                                <p className="text-gray-900">{restaurant.engagement_metrics.unique_sessions}</p>
                                                {restaurant.engagement_metrics.days_since_last_activity !== null && (
                                                  <p className="text-xs text-gray-500">
                                                    {restaurant.engagement_metrics.days_since_last_activity === 0 
                                                      ? 'Today' 
                                                      : `${restaurant.engagement_metrics.days_since_last_activity}d ago`}
                                                  </p>
                                                )}
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="flex flex-wrap gap-1 max-w-xs">
                                                {restaurant.recommendations.slice(0, 2).map((rec: string, recIdx: number) => (
                                                  <span key={recIdx} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                    {rec}
                                                  </span>
                                                ))}
                                                {restaurant.recommendations.length > 2 && (
                                                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                                    +{restaurant.recommendations.length - 2} more
                                                  </span>
                                                )}
                                                {restaurant.recommendations.length === 0 && (
                                                  <span className="text-xs text-gray-400">No issues</span>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-center py-8">No restaurant health data available</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No restaurant health data available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary-600" />
                Invite User
                </h3>
                <button
                onClick={() => {
                  setShowCreateUserModal(false)
                  setUserMessage('')
                  setUserForm({
                    name: '',
                    email: '',
                    role: 'restaurant',
                  })
                }}
                  className="text-gray-400 hover:text-gray-600"
                disabled={isCreatingUser}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

            {userMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                userMessage.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {userMessage}
              </div>
            )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                  </label>
                  <input
                    type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="John Doe"
                  disabled={isCreatingUser}
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                    </label>
                    <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="user@example.com"
                  disabled={isCreatingUser}
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                  </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value as 'restaurant' | 'sales_rep'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  disabled={isCreatingUser}
                >
                  <option value="restaurant">Restaurant Account Manager</option>
                  <option value="sales_rep">Sales Representative</option>
                </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                  onClick={handleSendInvite}
                  disabled={isCreatingUser || !userForm.name || !userForm.email}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                  {isCreatingUser ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setUserMessage('')
                    setUserForm({
                      name: '',
                      email: '',
                      role: 'restaurant',
                    })
                  }}
                  disabled={isCreatingUser}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900">Confirm Action</h3>
            </div>
            <p className="text-gray-700 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!confirmAction || !confirmAction.type) return
                  
                  if (confirmAction.type === 'pause-restaurant') {
                    handleRestaurantPause(confirmAction.item.id, false)
                    setConfirmAction(null)
                  } else if (confirmAction.type === 'unpause-restaurant') {
                    handleRestaurantPause(confirmAction.item.id, true)
                    setConfirmAction(null)
                  } else if (confirmAction.type === 'delete-restaurant') {
                    handleRestaurantDelete(confirmAction.item.id)
                  } else if (confirmAction.type === 'pause-user') {
                    handleUserPause(confirmAction.item.email, 'paused')
                    setConfirmAction(null)
                  } else if (confirmAction.type === 'unpause-user') {
                    handleUserPause(confirmAction.item.email, 'active')
                    setConfirmAction(null)
                  } else if (confirmAction.type === 'delete-user') {
                    handleUserDelete(confirmAction.item.email)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  confirmAction.type && confirmAction.type.includes('delete')
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : confirmAction.type && (confirmAction.type.includes('restore') || confirmAction.type.includes('unpause'))
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {confirmAction.type && confirmAction.type.includes('delete') 
                  ? 'Delete' 
                  : confirmAction.type && (confirmAction.type.includes('restore') || confirmAction.type.includes('unpause'))
                  ? 'Confirm'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Health Score Breakdown Modal */}
      {selectedRestaurantBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Health Score Breakdown: {selectedRestaurantBreakdown.restaurant_name}
              </h3>
              <button
                onClick={() => setSelectedRestaurantBreakdown(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className={`rounded-lg p-4 border-2 ${
                selectedRestaurantBreakdown.overall_health_score >= 70
                  ? 'bg-green-50 border-green-200'
                  : selectedRestaurantBreakdown.overall_health_score >= 40
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Overall Health Score</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedRestaurantBreakdown.score_breakdown?.formula?.calculation || 
                       `${selectedRestaurantBreakdown.completeness_score} × 0.6 + ${selectedRestaurantBreakdown.engagement_score} × 0.4 = ${selectedRestaurantBreakdown.overall_health_score}`}
                    </p>
                  </div>
                  <div className={`text-4xl font-bold ${
                    selectedRestaurantBreakdown.overall_health_score >= 70 ? 'text-green-600' :
                    selectedRestaurantBreakdown.overall_health_score >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedRestaurantBreakdown.overall_health_score}
                  </div>
                </div>
              </div>

              {/* Completeness Score Breakdown */}
              {selectedRestaurantBreakdown.score_breakdown?.completeness_factors && (
                <div>
                  <h5 className="text-md font-semibold text-gray-900 mb-3">
                    Data Completeness Score: {selectedRestaurantBreakdown.completeness_score}/100 (60% weight)
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedRestaurantBreakdown.score_breakdown.completeness_factors).map(([key, factor]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {factor.hasValue ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                          <span className="text-gray-700 capitalize">
                            {key === 'ownerEmail' ? 'Account Manager Email' :
                             key === 'priceRange' ? 'Price Range' :
                             key === 'websiteUrl' ? 'Website URL' :
                             key === 'menuItems' ? `Menu Items${factor.count ? ` (${factor.count})` : ''}` :
                             key}
                          </span>
                        </div>
                        <span className={`font-medium ${
                          factor.hasValue ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {factor.points}/{factor.maxPoints} points
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-300 flex items-center justify-between font-semibold">
                      <span className="text-gray-900">Total Completeness:</span>
                      <span className="text-gray-900">{selectedRestaurantBreakdown.completeness_score}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Score Breakdown */}
              {selectedRestaurantBreakdown.score_breakdown?.engagement_breakdown && (
                <div>
                  <h5 className="text-md font-semibold text-gray-900 mb-3">
                    Engagement Score: {selectedRestaurantBreakdown.engagement_score}/100 (40% weight)
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Unique Sessions:</span>
                        <span className="font-medium text-gray-900">
                          {selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.unique_sessions || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 ml-4">→ Session Points (up to 50):</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.sessionPoints || 0)}/{selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.maxSessionPoints}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Completion Rate:</span>
                        <span className="font-medium text-gray-900">
                          {selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.unique_sessions > 0
                            ? Math.round((selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.completed_sessions / selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.unique_sessions) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 ml-4">→ Completion Points (up to 30):</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.completionPoints || 0)}/{selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.maxCompletionPoints}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Avg Messages per Session:</span>
                        <span className="font-medium text-gray-900">
                          {selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.avg_messages_per_session
                            ? selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.avg_messages_per_session.toFixed(1)
                            : '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 ml-4">→ Message Volume Points (up to 20):</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.messageVolumePoints || 0)}/{selectedRestaurantBreakdown.score_breakdown.engagement_breakdown.maxMessageVolumePoints}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-300 flex items-center justify-between font-semibold">
                      <span className="text-gray-900">Total Engagement:</span>
                      <span className="text-gray-900">{selectedRestaurantBreakdown.engagement_score}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedRestaurantBreakdown.recommendations && selectedRestaurantBreakdown.recommendations.length > 0 && (
                <div>
                  <h5 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h5>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedRestaurantBreakdown.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedRestaurantBreakdown(null)
                    router.push(`/admin/restaurant/${selectedRestaurantBreakdown.widget_id}/dashboard`)
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Restaurant Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
