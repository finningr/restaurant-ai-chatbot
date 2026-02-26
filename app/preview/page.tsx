'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'

function PreviewPageContent() {
  const searchParams = useSearchParams()
  const [restaurantData, setRestaurantData] = useState<any>(null)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const [showBubble, setShowBubble] = useState(false)

  // Load restaurant data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const urlParam = searchParams.get('url') || 'https://www.vintagehimalayan.com/Home'
    const urlKey = `restaurantData_${urlParam}`
    const stored = localStorage.getItem(urlKey)
    if (stored) {
      try {
        setRestaurantData(JSON.parse(stored))
      } catch {
        console.error('Failed to parse stored restaurant data')
      }
    }
  }, [searchParams])

  // Register preview data and get token
  useEffect(() => {
    if (!restaurantData) return
    const register = async () => {
      try {
        const res = await fetch('/api/preview/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restaurantData)
        })
        if (res.ok) {
          const { token } = await res.json()
          setPreviewToken(token)
        }
      } catch (err) {
        console.error('Failed to register preview:', err)
      }
    }
    register()
  }, [restaurantData])

  // Listen for minimize from widget
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'minimize') setIsChatExpanded(false)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Chat bubble when minimized
  useEffect(() => {
    if (!isChatExpanded) {
      const t = setTimeout(() => setShowBubble(true), 4000)
      return () => clearTimeout(t)
    }
    setShowBubble(false)
  }, [isChatExpanded])

  const websiteUrl = restaurantData?.websiteUrl || restaurantData?.url || searchParams.get('url')
  const restaurantName = restaurantData?.name || searchParams.get('name') || 'Restaurant'
  const primaryColor = restaurantData?.colors?.primary || restaurantData?.primaryColor || searchParams.get('primaryColor') || '#0284c7'

  if (!websiteUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Website URL Provided</h1>
          <p className="text-gray-600">Please provide a website URL to preview.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Live Preview - {restaurantName}</h1>
              <p className="text-sm text-primary-100">See how your AI chatbot looks with your brand colors!</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50"
              >
                Join Beta
              </Link>
              <Link
                href={`/manual-input?url=${encodeURIComponent(websiteUrl)}`}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Website Preview with Chatbot Overlay */}
      <div className="relative h-[calc(100vh-88px)] bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Website Preview */}
        <div className="absolute inset-0">
          <iframe
            src={websiteUrl}
            className="w-full h-full border-0"
            title={`${restaurantName} Website Preview`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            loading="lazy"
          />
        </div>

        {/* Chat Widget - same UI as admin (iframe to widget) */}
        <div className="fixed bottom-6 right-6 z-50">
          {isChatExpanded && previewToken ? (
            <div
              style={{
                width: '350px',
                height: '600px',
                borderRadius: '12px',
                boxShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 32px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}
            >
              <iframe
                src={`/widget/preview?test=true&token=${encodeURIComponent(previewToken)}`}
                style={{
                  border: 'none',
                  display: 'block',
                  width: '350px',
                  height: '600px',
                  margin: 0,
                  padding: 0
                }}
                title="Chatbot Preview Widget"
                allow="clipboard-read; clipboard-write"
                scrolling="no"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsChatExpanded(true)}
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
              aria-label="Open chat"
            >
              <MessageCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Chat bubble when minimized (optional) */}
        {!isChatExpanded && showBubble && (
          <div className="fixed bottom-24 right-6 z-40">
            <div className="bg-white border-2 border-gray-200 shadow-lg p-3 max-w-xs rounded-lg">
              <p className="text-gray-900 font-medium text-sm">Questions? Ask me!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <PreviewPageContent />
      </Suspense>
    </div>
  )
}
