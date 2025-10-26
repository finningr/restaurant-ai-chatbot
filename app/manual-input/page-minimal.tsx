'use client'

import { useState } from 'react'
import { Bot, Home, Save, Check } from 'lucide-react'
import Link from 'next/link'

export default function ManualInputPage() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    hours: '',
    menuItems: '',
    cuisine: 'American',
    priceRange: '$$',
    profitableDishes: '',
    upsellingStyle: 'educational',
    dietaryRestrictions: '',
    dietaryRestrictionsOther: '',
    specialServices: '',
    specialServicesOther: '',
    paymentMethods: '',
    paymentMethodsOther: '',
    dressCode: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started')
  }

  const handleMenuReviewApprove = async (approvedItems: any[]) => {
    console.log('Menu review approved')
  }

  const handleMenuReviewCancel = () => {
    console.log('Menu review cancelled')
  }

  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">Your restaurant information has been processed.</p>
          <Link 
            href="/preview"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            View Your Chatbot
          </Link>
        </div>
      </div>
    )
  }

  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div>Menu Review</div>
      </div>
    )
  }

  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parsing Your Menu</h2>
          <p className="text-gray-600 mb-6">AI is analyzing your menu items...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Restaurant Information
        </h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              required
              value={formData.restaurantName}
              onChange={(e) => handleInputChange('restaurantName', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
