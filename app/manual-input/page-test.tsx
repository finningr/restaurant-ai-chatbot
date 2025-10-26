'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Home, Save, Check } from 'lucide-react'
import Link from 'next/link'
import MenuReview from '@/app/components/MenuReview'

export default function ManualInputPage() {
  const searchParams = useSearchParams()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Restaurant Information
        </h1>
        <form className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
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
