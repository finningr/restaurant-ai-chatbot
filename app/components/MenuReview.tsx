'use client'

import { useState } from 'react'
import { Check, X, Edit3, Save } from 'lucide-react'

interface MenuItem {
  name: string
  price: number | null
  category: string
  description: string
  dietaryTags?: string[]
  isProfitable?: boolean
}

interface MenuReviewProps {
  menuItems: MenuItem[]
  onApprove: (items: MenuItem[]) => void
  onCancel: () => void
}

export default function MenuReview({ menuItems, onApprove, onCancel }: MenuReviewProps) {
  const [items, setItems] = useState<MenuItem[]>(menuItems.map(item => ({ ...item, isProfitable: false })))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedItem, setEditedItem] = useState<MenuItem | null>(null)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditedItem({ ...items[index] })
  }

  const handleSave = (index: number) => {
    if (editedItem) {
      const newItems = [...items]
      newItems[index] = editedItem
      setItems(newItems)
      setEditingIndex(null)
      setEditedItem(null)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditedItem(null)
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleToggleProfitable = (index: number) => {
    const newItems = [...items]
    newItems[index].isProfitable = !newItems[index].isProfitable
    setItems(newItems)
  }

  const handleApprove = () => {
    onApprove(items)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Menu Items</h2>
        <p className="text-gray-600">
          AI parsed your menu. Please review and fix any errors before saving.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={editedItem?.name || ''}
                    onChange={(e) => setEditedItem({ ...editedItem!, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedItem?.price || ''}
                      onChange={(e) => setEditedItem({ 
                        ...editedItem!, 
                        price: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15.99"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editedItem?.category || ''}
                      onChange={(e) => setEditedItem({ ...editedItem!, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Appetizer">Appetizer</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Side">Side</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editedItem?.description || ''}
                    onChange={(e) => setEditedItem({ ...editedItem!, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editedItem?.dietaryTags?.join(', ') || ''}
                    onChange={(e) => setEditedItem({ 
                      ...editedItem!, 
                      dietaryTags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : []
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="GF, DF, V, VG"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.price && (
                      <span className="text-lg font-bold text-green-600">${item.price}</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {item.category}
                    </span>
                    {item.isProfitable && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-semibold">
                        💰 Profitable
                      </span>
                    )}
                  </div>
                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {item.dietaryTags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isProfitable || false}
                      onChange={() => handleToggleProfitable(index)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Profitable</span>
                  </label>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No menu items to review. All items were removed.</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleApprove}
          disabled={items.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          Looks Good - Save Menu
        </button>
      </div>
    </div>
  )
}
