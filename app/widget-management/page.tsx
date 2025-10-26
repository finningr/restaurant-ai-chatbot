'use client'

import { useState, useEffect } from 'react'
import { Search, Edit, Save, X, Plus, Trash2, Eye } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  widget_id: string
  description: string
  phone: string
  email: string
  cuisine: string
  price_range: string
  is_active: boolean
  created_at: string
}

export default function WidgetManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Restaurant>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant.id)
    setEditingData({ ...restaurant })
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch('/api/update-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: editingData.widget_id,
          updateData: editingData
        })
      })

      if (response.ok) {
        setRestaurants(prev => 
          prev.map(r => r.id === id ? { ...r, ...editingData } : r)
        )
        setEditingId(null)
        setEditingData({})
      }
    } catch (error) {
      console.error('Failed to update restaurant:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const restaurant = restaurants.find(r => r.id === id)
      if (!restaurant) return

      const response = await fetch('/api/update-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: restaurant.widget_id,
          updateData: { is_active: !isActive }
        })
      })

      if (response.ok) {
        setRestaurants(prev => 
          prev.map(r => r.id === id ? { ...r, is_active: !isActive } : r)
        )
      }
    } catch (error) {
      console.error('Failed to toggle restaurant status:', error)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.widget_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Management</h1>
          <p className="text-gray-600">Manage your restaurant chatbots and widgets</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants or widget IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Widget ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === restaurant.id ? (
                      <input
                        type="text"
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.cuisine} • {restaurant.price_range}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === restaurant.id ? (
                      <input
                        type="text"
                        value={editingData.widget_id || ''}
                        onChange={(e) => setEditingData({ ...editingData, widget_id: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 font-mono">{restaurant.widget_id}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(restaurant.id, restaurant.is_active)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        restaurant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editingId === restaurant.id ? (
                        <>
                          <button
                            onClick={() => handleSave(restaurant.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(restaurant)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/embed?id=${restaurant.widget_id}`, '_blank')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        )}
      </div>
    </div>
  )
}
