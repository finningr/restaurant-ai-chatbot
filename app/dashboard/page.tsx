'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bot, LogOut, Settings, BarChart3, Globe, User, Building, Clock, MapPin, Phone, Mail, Save, Zap, ArrowRight, Package } from 'lucide-react'

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

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
    }

    if (session?.user) {
      setRestaurantInfo(prev => ({
        ...prev,
        name: session.user?.name || 'My Restaurant',
        email: session.user?.email || 'info@restaurant.com'
      }))
    }
  }, [status, session, router])

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

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/marketing' })
  }

  const userRole = (session?.user as any)?.image // Role is stored in image field temporarily
  const isAdmin = userRole === 'admin'
  const hasChatbot = isAdmin // Admin has chatbot, new users don't

  // Empty state for users without chatbot
  if (!hasChatbot) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-primary-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">RestaurantAI</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.name}</p>
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
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <span className="text-xl font-bold text-gray-900">RestaurantAI</span>
                {isAdmin && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Admin</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.name}</p>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Total Conversations</h3>
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                    <p className="text-sm text-green-600 mt-2">↑ 23% from last month</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Customer Satisfaction</h3>
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">4.8/5</p>
                    <p className="text-sm text-green-600 mt-2">↑ 0.3 from last month</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Response Time</h3>
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0.8s</p>
                    <p className="text-sm text-green-600 mt-2">↓ 0.2s faster</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/demo')}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <Bot className="w-6 h-6 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">View Live Chatbot</p>
                        <p className="text-sm text-gray-600">See your chatbot in action</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <Settings className="w-6 h-6 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Configure Settings</p>
                        <p className="text-sm text-gray-600">Customize your chatbot</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Restaurant Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.name}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.phone}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={restaurantInfo.email}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Hours
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.hours}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, hours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.address}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={restaurantInfo.description}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties
                    </label>
                    <textarea
                      value={restaurantInfo.specialties}
                      onChange={(e) => setRestaurantInfo({...restaurantInfo, specialties: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Integration Code</h2>
                <p className="text-gray-600">
                  Copy and paste this code into your website to add the chatbot widget.
                </p>
                
                <div className="bg-gray-900 rounded-lg p-6">
                  <code className="text-green-400 text-sm">
                    {`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://restaurantai.com/widget.js';
    script.dataset.restaurantId = '${session?.user?.email}';
    document.head.appendChild(script);
  })();
</script>`}
                  </code>
                </div>
                
                <button
                  onClick={() => router.push('/embed')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                >
                  View Full Integration Guide
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}