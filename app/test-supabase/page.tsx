'use client'

import { useState, useEffect } from 'react'

export default function TestSupabasePage() {
  const [restaurantData, setRestaurantData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/restaurant/vintage-himalayan-001')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setRestaurantData(data)
      console.log('Restaurant data:', data)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Supabase Integration Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {restaurantData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-semibold text-lg mb-4">
              ✅ Connection Successful!
            </h3>
            <div className="space-y-2">
              <p><strong>Restaurant:</strong> {restaurantData.name}</p>
              <p><strong>Widget ID:</strong> {restaurantData.widget_id}</p>
              <p><strong>Cuisine:</strong> {restaurantData.cuisine}</p>
              <p><strong>Phone:</strong> {restaurantData.phone}</p>
              <p><strong>Active:</strong> {restaurantData.is_active ? 'Yes' : 'No'}</p>
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-green-700 font-medium">
                View Full Data
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(restaurantData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-yellow-800 font-semibold mb-2">Next Steps:</h3>
          <ol className="text-yellow-700 space-y-1">
            <li>1. Create a Supabase project at supabase.com</li>
            <li>2. Run the SQL schema from supabase-schema.sql in your Supabase SQL Editor</li>
            <li>3. Update your .env.local with your actual Supabase credentials</li>
            <li>4. Test this page again</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
