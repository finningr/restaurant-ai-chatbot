'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function AdminRestaurantViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const widgetId = params?.widgetId as string
  
  const [restaurantName, setRestaurantName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const fetchRestaurantInfo = async () => {
      if (!widgetId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants?widget_id=${widgetId}`)
        if (response.ok) {
          const data = await response.json()
          // API returns an array directly
          if (Array.isArray(data) && data.length > 0) {
            setRestaurantName(data[0].name || 'Restaurant')
          } else if (data.restaurants && data.restaurants.length > 0) {
            setRestaurantName(data.restaurants[0].name || 'Restaurant')
          }
        }
      } catch (err) {
        console.error('Error fetching restaurant info:', err)
        setError('Failed to load restaurant information')
      } finally {
        setIsLoading(false)
      }
    }

    if (widgetId) {
      fetchRestaurantInfo()
    }
  }, [widgetId])

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {restaurantName || 'Restaurant'} - Chatbot Preview
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Test the chatbot as it appears to customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {widgetId ? (
                <iframe
                  src={`/widget/${widgetId}?test=true`}
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No widget ID provided</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

