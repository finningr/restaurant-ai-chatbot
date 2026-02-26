'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bot, LogOut, Building2, Mail, Phone, Eye, Plus, UserPlus, X } from 'lucide-react'

export default function SalesDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' })
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const userRole = (session?.user as any)?.role
    if (userRole !== 'sales_rep') {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchDemos = async () => {
      if (!session?.user?.email) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants?created_by=${encodeURIComponent(session.user.email)}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurants(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching demos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchDemos()
    }
  }, [status, session])

  const handleSendInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      setInviteMessage('Please fill in all required fields')
      return
    }
    setIsSendingInvite(true)
    setInviteMessage('')
    try {
      const response = await fetch('/api/sales/invite-restaurant-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteForm.name,
          email: inviteForm.email,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setInviteMessage(data.error || 'Failed to send invite')
        setIsSendingInvite(false)
        return
      }
      setInviteMessage(`Invite sent to ${inviteForm.email}!`)
      setInviteForm({ name: '', email: '' })
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteMessage('')
      }, 1500)
    } catch (err) {
      setInviteMessage('Failed to send invite')
    } finally {
      setIsSendingInvite(false)
    }
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
                <span className="text-xl font-bold text-gray-900">Front of House AI</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => router.push('/marketing')}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Demos
              </h1>
              <p className="text-gray-600">
                View and manage restaurants you've created
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                Create Restaurant Account Manager
              </button>
              <button
                onClick={() => router.push('/manual-input?sales_rep=true')}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create Demo
              </button>
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No demos yet</p>
                <p className="text-gray-500 mb-6">Restaurants you create will appear here</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium shadow-sm"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Restaurant Account Manager
                  </button>
                  <button
                    onClick={() => router.push('/manual-input?sales_rep=true')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Demo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/admin/restaurant/${restaurant.widget_id}/dashboard`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
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
            )}
          </div>
        </div>
      </div>

      {/* Create Restaurant Account Manager Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary-600" />
                Create Restaurant Account Manager
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteMessage('')
                  setInviteForm({ name: '', email: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSendingInvite}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Invite a Restaurant Account Manager. They&apos;ll receive an email to set up their account.
            </p>
            {inviteMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                inviteMessage.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {inviteMessage}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="John Doe"
                  disabled={isSendingInvite}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="owner@restaurant.com"
                  disabled={isSendingInvite}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite || !inviteForm.name || !inviteForm.email}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteMessage('')
                    setInviteForm({ name: '', email: '' })
                  }}
                  disabled={isSendingInvite}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
