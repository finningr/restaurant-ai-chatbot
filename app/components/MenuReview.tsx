'use client'

import { useState, useEffect } from 'react'
import { Check, X, Edit3, Save, PlusCircle } from 'lucide-react'
import ColorPicker from './ColorPicker'

interface MenuItem {
  name: string
  price: number | null
  category: string
  description: string
  dietaryTags?: string[]
  isProfitable?: boolean
  menuType?: string | null
}

interface RestaurantInfo {
  name: string
  description: string
  phone: string
  email: string
  ownerEmail?: string
  address: string | { street?: string; city?: string; state?: string; zip?: string; country?: string }
  hours: string | Record<string, string> | { main?: Record<string, string>; kitchen?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string }
  cuisine: string
  priceRange: string
  websiteUrl?: string
  brandColors?: {
    primary: string
    secondary: string
    accent: string
  }
  deliveryLinks?: Record<string, string | Array<{ name: string; url: string }>> | null
  reservationLink?: string | null
  cateringLink?: string | null
  specialServices?: string[]
}

interface MenuReviewProps {
  menuItems: MenuItem[]
  restaurantInfo?: RestaurantInfo
  onApprove: (items: MenuItem[], restaurantInfo?: RestaurantInfo) => void
  onCancel: () => void
  isAdmin?: boolean
  /** When provided, saving a restaurant field (e.g. hours, phone) persists to DB immediately. Used in restaurant/settings tab, not in review form after manual input. */
  onFieldSave?: (menuItems: MenuItem[], restaurantInfo: RestaurantInfo) => void | Promise<void>
}

type MenuItemWithIndex = MenuItem & { originalIndex: number }

export default function MenuReview({ menuItems, restaurantInfo, onApprove, onCancel, isAdmin = false, onFieldSave }: MenuReviewProps) {
  // Validate menuItems but don't return early (hooks must be called unconditionally)
  const validMenuItems = Array.isArray(menuItems) ? menuItems : []
  
  // Preserve isProfitable value from props, default to false if not provided
  const [items, setItems] = useState<MenuItem[]>(validMenuItems.map(item => ({ 
    ...item, 
    isProfitable: item.isProfitable ?? false 
  })))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedItem, setEditedItem] = useState<MenuItem | null>(null)
  const [editedRestaurantInfo, setEditedRestaurantInfo] = useState<RestaurantInfo | null>(restaurantInfo ? {
    ...restaurantInfo,
    brandColors: restaurantInfo.brandColors || {
      primary: '#4F46E5',
      secondary: '#6366F1',
      accent: '#818CF8'
    }
  } : null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string | Record<string, string> | { main?: Record<string, string>; kitchen?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string } | null>(null)
  const [editingDeliveryLinks, setEditingDeliveryLinks] = useState(false)
  const [deliveryLinksEdit, setDeliveryLinksEdit] = useState<{
    website_order: string; doordash: string; uber_eats: string; grubhub: string;
    custom: Array<{ name: string; url: string }>
  }>({ website_order: '', doordash: '', uber_eats: '', grubhub: '', custom: [] })
  const [reservationLinkEdit, setReservationLinkEdit] = useState('')
  const [cateringLinkEdit, setCateringLinkEdit] = useState('')
  const [specialServicesEdit, setSpecialServicesEdit] = useState<string[]>([])
  const specialServicesOptions = ['Takeout', 'Delivery', 'Delivery (in-house)', 'Catering', 'Reservations', 'Outdoor seating', 'Private events']

  // Sync state when menuItems prop changes (e.g., when settings are reloaded)
  useEffect(() => {
    const validMenuItems = Array.isArray(menuItems) ? menuItems : []
    setItems(validMenuItems.map(item => ({ 
      ...item, 
      isProfitable: item.isProfitable ?? false 
    })))
    // Also sync restaurant info if it changes
    if (restaurantInfo) {
      setEditedRestaurantInfo(restaurantInfo)
    }
  }, [menuItems, restaurantInfo])

  // Auto-sync special services from links (when editing delivery/ordering section)
  useEffect(() => {
    const hasReservation = !!reservationLinkEdit?.trim()
    const hasCatering = !!cateringLinkEdit?.trim()
    const has3rdPartyDelivery = !!(deliveryLinksEdit.doordash?.trim() || deliveryLinksEdit.uber_eats?.trim() || deliveryLinksEdit.grubhub?.trim() || deliveryLinksEdit.custom?.some((c: any) => c?.url?.trim()))
    setSpecialServicesEdit(prev => {
      let next = [...prev]
      if (hasReservation && !next.includes('Reservations')) next = [...next, 'Reservations']
      if (!hasReservation && next.includes('Reservations')) next = next.filter(s => s !== 'Reservations')
      if (hasCatering && !next.includes('Catering')) next = [...next, 'Catering']
      if (!hasCatering && next.includes('Catering')) next = next.filter(s => s !== 'Catering')
      if (has3rdPartyDelivery && !next.includes('Delivery')) next = [...next, 'Delivery']
      if (!has3rdPartyDelivery && next.includes('Delivery')) next = next.filter(s => s !== 'Delivery')
      return next
    })
  }, [reservationLinkEdit, cateringLinkEdit, deliveryLinksEdit.doordash, deliveryLinksEdit.uber_eats, deliveryLinksEdit.grubhub, deliveryLinksEdit.custom])

  const handleEdit = (index: number) => {
    // Prevent editing if already editing another item
    if (editingIndex !== null && editingIndex !== index) {
      alert('Please finish editing the current item before editing another one.')
      return
    }
    setEditingIndex(index)
    setEditedItem({ ...items[index] })
  }

  const handleSave = async (index: number) => {
    if (editedItem) {
      // Validate that name is filled out
      if (!editedItem.name || editedItem.name.trim() === '') {
        alert('Please enter an item name before saving.')
        return
      }
      const newItems = [...items]
      newItems[index] = editedItem
      setItems(newItems)
      setEditingIndex(null)
      setEditedItem(null)
      if (onFieldSave && editedRestaurantInfo) {
        await onFieldSave(newItems, editedRestaurantInfo)
      }
    }
  }

  const handleCancel = () => {
    // If canceling a new item (empty name), remove it from the list
    if (editingIndex !== null && editedItem && (!editedItem.name || editedItem.name.trim() === '')) {
      const newItems = items.filter((_, i) => i !== editingIndex)
      setItems(newItems)
    }
    setEditingIndex(null)
    setEditedItem(null)
  }

  const handleRemove = async (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    if (onFieldSave && editedRestaurantInfo) {
      await onFieldSave(newItems, editedRestaurantInfo)
    }
  }

  const handleAddItem = () => {
    // Prevent adding if already editing an item
    if (editingIndex !== null) {
      alert('Please finish editing the current item before adding a new one.')
      return
    }
    
    const newItem: MenuItem = {
      name: '',
      price: null,
      category: 'Main Course',
      description: '',
      dietaryTags: [],
      isProfitable: false,
      menuType: null
    }
    // Add new item at the beginning of the array
    const newItems = [newItem, ...items]
    setItems(newItems)
    // Automatically start editing the new item (index 0 since it's at the top)
    setEditedItem({ ...newItem })
    setEditingIndex(0)
  }

  const handleToggleProfitable = async (index: number) => {
    const newItems = [...items]
    newItems[index].isProfitable = !newItems[index].isProfitable
    setItems(newItems)
    if (onFieldSave && editedRestaurantInfo) {
      await onFieldSave(newItems, editedRestaurantInfo)
    }
  }

  const handleApprove = () => {
    onApprove(items, editedRestaurantInfo || undefined)
  }

  const handleFieldEdit = (field: string) => {
    if (!editedRestaurantInfo) return
    
    if (field === 'address') {
      setTempValue(editedRestaurantInfo.address)
    } else if (field === 'hours') {
      const h = editedRestaurantInfo.hours
      const days = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' }
      if (typeof h === 'string') {
        setTempValue({ main: days, kitchen: undefined, pickup: undefined, happy_hour: '', holiday: '', brunch: '', bar: '' })
      } else if (h && typeof h === 'object' && (h as any).main) {
        setTempValue({ main: (h as any).main || days, kitchen: (h as any).kitchen, pickup: (h as any).pickup, happy_hour: (h as any).happy_hour || '', holiday: (h as any).holiday || '', brunch: (h as any).brunch || '', bar: (h as any).bar || '' })
      } else {
        const flat = h as Record<string, string>
        const main = Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => [d, flat?.[d] ?? '']))
        setTempValue({ main, kitchen: undefined, pickup: undefined, happy_hour: '', holiday: '', brunch: '', bar: '' })
      }
    } else if (field === 'brandColors') {
      setTempValue({ ...(editedRestaurantInfo.brandColors || { primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8' }) })
    } else {
      setTempValue((editedRestaurantInfo as any)[field] || '')
    }
    setEditingField(field)
  }

  const handleFieldSave = async (field: string) => {
    if (!editedRestaurantInfo || tempValue === null) return
    
    const updated = { ...editedRestaurantInfo, [field]: tempValue }
    setEditedRestaurantInfo(updated)
    setEditingField(null)
    setTempValue(null)
    if (onFieldSave) {
      await onFieldSave(items, updated)
    }
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setTempValue(null)
  }

  const formatAddress = (address: string | { street?: string; city?: string; state?: string; zip?: string; country?: string }): string => {
    if (typeof address === 'string') return address
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zip) parts.push(address.zip)
    return parts.join(', ')
  }

  const formatDayHours = (dayHours: Record<string, string> | undefined): string => {
    if (!dayHours || typeof dayHours !== 'object') return ''
    return Object.entries(dayHours)
      .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`)
      .join('\n')
  }

  const formatHours = (hours: string | Record<string, string> | { main?: Record<string, string>; kitchen?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string }): string => {
    if (typeof hours === 'string') return hours
    const h = hours as { main?: Record<string, string>; kitchen?: Record<string, string>; pickup?: Record<string, string>; happy_hour?: string; holiday?: string; brunch?: string; bar?: string }
    if (h?.main && typeof h.main === 'object') {
      const parts: string[] = []
      parts.push('Main: ' + formatDayHours(h.main).replace(/\n/g, '; '))
      if (h.kitchen && Object.keys(h.kitchen).length > 0 && Object.values(h.kitchen).some(v => v?.trim())) parts.push('Kitchen: ' + formatDayHours(h.kitchen).replace(/\n/g, '; '))
      if (h.pickup && Object.keys(h.pickup).length > 0) parts.push('Pickup: ' + formatDayHours(h.pickup).replace(/\n/g, '; '))
      if (h.happy_hour) parts.push('Happy hour: ' + h.happy_hour)
      if (h.brunch) parts.push('Brunch: ' + h.brunch)
      if (h.bar) parts.push('Bar: ' + h.bar)
      if (h.holiday) parts.push('Holiday: ' + h.holiday)
      return parts.join('\n')
    }
    return Object.entries(hours as Record<string, string>)
      .filter(([k]) => !['main','kitchen','pickup','happy_hour','holiday','brunch','bar'].includes(k))
      .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`)
      .join('\n') || ''
  }

  // Group items by menu type if menu types exist
  const hasMenuTypes = items.some(item => item.menuType)
  const groupedByMenuType: Record<string, MenuItemWithIndex[]> = {}
  
  if (hasMenuTypes) {
    items.forEach((item, index) => {
      const menuType = item.menuType || 'All Day'
      if (!groupedByMenuType[menuType]) {
        groupedByMenuType[menuType] = []
      }
      groupedByMenuType[menuType].push({ ...item, originalIndex: index })
    })
  }

  // Show error if menuItems was invalid (after hooks)
  if (!menuItems || !Array.isArray(menuItems)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center text-red-600">
            <p>Error: Invalid menu items data</p>
            <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Menu Items and Restaurant Information</h2>
          <p className="text-gray-600">
            AI parsed your menu and formatted your restaurant information. Please review and fix any errors before saving.
          </p>
        </div>

        {/* Restaurant Information Section */}
        {editedRestaurantInfo && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Restaurant Information</h3>
            <div className="space-y-4">
              {/* Website URL Field - At top, editable only for admin */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="font-semibold text-gray-700">Website URL:</span>
                  {editingField === 'websiteUrl' && isAdmin ? (
                    <div className="mt-1 space-y-3">
                      <input
                        type="url"
                        value={tempValue as string || ''}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFieldSave('websiteUrl')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-gray-900">{editedRestaurantInfo.websiteUrl || 'Not provided'}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleFieldEdit('websiteUrl')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          {editedRestaurantInfo.websiteUrl ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Colors Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h4>
                {editingField === 'brandColors' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ColorPicker
                        label="Primary Color"
                        value={(tempValue as { primary?: string })?.primary || editedRestaurantInfo.brandColors?.primary || '#4F46E5'}
                        onChange={(color) => {
                          const tv = tempValue as { primary?: string; secondary?: string; accent?: string }
                          setTempValue({ ...tv, primary: color })
                        }}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        value={(tempValue as { secondary?: string })?.secondary || editedRestaurantInfo.brandColors?.secondary || '#6366F1'}
                        onChange={(color) => {
                          const tv = tempValue as { primary?: string; secondary?: string; accent?: string }
                          setTempValue({ ...tv, secondary: color })
                        }}
                      />
                      <ColorPicker
                        label="Accent Color"
                        value={(tempValue as { accent?: string })?.accent || editedRestaurantInfo.brandColors?.accent || '#818CF8'}
                        onChange={(color) => {
                          const tv = tempValue as { primary?: string; secondary?: string; accent?: string }
                          setTempValue({ ...tv, accent: color })
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFieldSave('brandColors')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleFieldCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Primary</span>
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: editedRestaurantInfo.brandColors?.primary || '#4F46E5' }}
                        title={`Primary: ${editedRestaurantInfo.brandColors?.primary || '#4F46E5'}`}
                      />
                      <span className="text-sm text-gray-600">Secondary</span>
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: editedRestaurantInfo.brandColors?.secondary || '#6366F1' }}
                        title={`Secondary: ${editedRestaurantInfo.brandColors?.secondary || '#6366F1'}`}
                      />
                      <span className="text-sm text-gray-600">Accent</span>
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: editedRestaurantInfo.brandColors?.accent || '#818CF8' }}
                        title={`Accent: ${editedRestaurantInfo.brandColors?.accent || '#818CF8'}`}
                      />
                    </div>
                    <button
                      onClick={() => handleFieldEdit('brandColors')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="font-semibold text-gray-700">Name:</span>
                  {editingField === 'name' ? (
                    <div className="mt-1 space-y-3">
                      <input
                        type="text"
                        value={tempValue as string || ''}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFieldSave('name')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-gray-900">{editedRestaurantInfo.name}</span>
                      <button
                        onClick={() => handleFieldEdit('name')}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Field */}
              {editedRestaurantInfo.description && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Description:</span>
                    {editingField === 'description' ? (
                      <div className="mt-1 space-y-3">
                        <textarea
                          value={tempValue as string || ''}
                          onChange={(e) => setTempValue(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('description')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start justify-between">
                        <p className="text-gray-900 flex-1">{editedRestaurantInfo.description}</p>
                        <button
                          onClick={() => handleFieldEdit('description')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone Field */}
              {editedRestaurantInfo.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Phone:</span>
                    {editingField === 'phone' ? (
                      <div className="mt-1 space-y-3">
                        <input
                          type="text"
                          value={tempValue as string || ''}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(303) 376-9954"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('phone')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-gray-900">{editedRestaurantInfo.phone}</span>
                        <button
                          onClick={() => handleFieldEdit('phone')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Restaurant Email Field */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="font-semibold text-gray-700">Restaurant Email:</span>
                  {editingField === 'email' ? (
                    <div className="mt-1 space-y-3">
                      <input
                        type="email"
                        value={tempValue as string || ''}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="info@restaurant.com"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFieldSave('email')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-gray-900">{editedRestaurantInfo.email || 'Not provided'}</span>
                      <button
                        onClick={() => handleFieldEdit('email')}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        {editedRestaurantInfo.email ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Email Field */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="font-semibold text-gray-700">Owner Email:</span>
                  {editingField === 'ownerEmail' ? (
                    <div className="mt-1 space-y-3">
                      <input
                        type="email"
                        value={tempValue as string || ''}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="owner@example.com"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFieldSave('ownerEmail')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-gray-900">{editedRestaurantInfo.ownerEmail || 'Not provided'}</span>
                      <button
                        onClick={() => handleFieldEdit('ownerEmail')}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        {editedRestaurantInfo.ownerEmail ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Field */}
              {editedRestaurantInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Address:</span>
                    {editingField === 'address' ? (
                      <div className="mt-1 space-y-3">
                        {typeof tempValue === 'string' ? (
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={(tempValue as any)?.street || ''}
                              onChange={(e) => setTempValue({ ...(tempValue as any), street: e.target.value })}
                              placeholder="Street address"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={(tempValue as any)?.city || ''}
                                onChange={(e) => setTempValue({ ...(tempValue as any), city: e.target.value })}
                                placeholder="City"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={(tempValue as any)?.state || ''}
                                onChange={(e) => setTempValue({ ...(tempValue as any), state: e.target.value })}
                                placeholder="State"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <input
                              type="text"
                              value={(tempValue as any)?.zip || ''}
                              onChange={(e) => setTempValue({ ...(tempValue as any), zip: e.target.value })}
                              placeholder="ZIP Code"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('address')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start justify-between">
                        <p className="text-gray-900 flex-1">{formatAddress(editedRestaurantInfo.address)}</p>
                        <button
                          onClick={() => handleFieldEdit('address')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hours Field */}
              {(editedRestaurantInfo.hours || editingField === 'hours') && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Hours:</span>
                    {editingField === 'hours' ? (
                      <div className="mt-1 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Main hours</label>
                          <div className="space-y-2">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                              <div key={day} className="flex items-center gap-2">
                                <label className="w-24 text-sm text-gray-600 capitalize">{day}:</label>
                                <input
                                  type="text"
                                  value={((tempValue as any)?.main)?.[day] || ''}
                                  onChange={(e) => {
                                    const tv = tempValue as any
                                    setTempValue({ ...tv, main: { ...(tv?.main || {}), [day]: e.target.value } })
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                                  placeholder="9am-10pm or Closed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Kitchen hours (optional)</label>
                          <p className="text-xs text-gray-500 mb-1">When kitchen stops taking orders—often earlier than main</p>
                          <div className="space-y-2">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                              <div key={day} className="flex items-center gap-2">
                                <label className="w-24 text-sm text-gray-600 capitalize">{day}:</label>
                                <input
                                  type="text"
                                  value={((tempValue as any)?.kitchen)?.[day] || ''}
                                  onChange={(e) => {
                                    const tv = tempValue as any
                                    setTempValue({ ...tv, kitchen: { ...(tv?.kitchen || {}), [day]: e.target.value } })
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                                  placeholder="Same as main if blank"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Pickup / takeout hours (optional)</label>
                          <div className="space-y-2">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                              <div key={day} className="flex items-center gap-2">
                                <label className="w-24 text-sm text-gray-600 capitalize">{day}:</label>
                                <input
                                  type="text"
                                  value={((tempValue as any)?.pickup)?.[day] || ''}
                                  onChange={(e) => {
                                    const tv = tempValue as any
                                    const pickup = { ...(tv?.pickup || {}), [day]: e.target.value }
                                    setTempValue({ ...tv, pickup })
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                                  placeholder="Same as main if blank"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Happy hour (optional)</label>
                          <input
                            type="text"
                            value={(tempValue as any)?.happy_hour || ''}
                            onChange={(e) => setTempValue({ ...(tempValue as any), happy_hour: e.target.value })}
                            placeholder="e.g. Mon-Fri 3-6pm"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Brunch (optional)</label>
                          <input
                            type="text"
                            value={(tempValue as any)?.brunch || ''}
                            onChange={(e) => setTempValue({ ...(tempValue as any), brunch: e.target.value })}
                            placeholder="e.g. Sat-Sun 10am-2pm"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Bar hours (optional)</label>
                          <input
                            type="text"
                            value={(tempValue as any)?.bar || ''}
                            onChange={(e) => setTempValue({ ...(tempValue as any), bar: e.target.value })}
                            placeholder="e.g. Daily 4pm-2am"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Holiday hours (optional)</label>
                          <textarea
                            rows={2}
                            value={(tempValue as any)?.holiday || ''}
                            onChange={(e) => setTempValue({ ...(tempValue as any), holiday: e.target.value })}
                            placeholder="e.g. Thanksgiving: Closed. Christmas Eve: 11am-5pm."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('hours')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start justify-between">
                        <pre className="text-gray-900 whitespace-pre-wrap font-sans flex-1">{formatHours(editedRestaurantInfo.hours || '')}</pre>
                        <button
                          onClick={() => handleFieldEdit('hours')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cuisine Field */}
              {editedRestaurantInfo.cuisine && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Cuisine:</span>
                    {editingField === 'cuisine' ? (
                      <div className="mt-1 space-y-3">
                        <input
                          type="text"
                          value={tempValue as string || ''}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('cuisine')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-gray-900">{editedRestaurantInfo.cuisine}</span>
                        <button
                          onClick={() => handleFieldEdit('cuisine')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Range Field */}
              {editedRestaurantInfo.priceRange && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">Price Range:</span>
                    {editingField === 'priceRange' ? (
                      <div className="mt-1 space-y-3">
                        <select
                          value={tempValue as string || ''}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="$">$ - Inexpensive</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Expensive</option>
                          <option value="$$$$">$$$$ - Very Expensive</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFieldSave('priceRange')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleFieldCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-gray-900">{editedRestaurantInfo.priceRange}</span>
                        <button
                          onClick={() => handleFieldEdit('priceRange')}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery / Ordering Links */}
              <div className="flex items-start gap-3 border-t pt-4 mt-4">
                <div className="flex-1">
                  <span className="font-semibold text-gray-700">Delivery / Ordering Links:</span>
                  {editingDeliveryLinks ? (
                    <div className="mt-1 space-y-3">
                      <div className="grid gap-2">
                        <div>
                          <label className="block text-xs text-gray-600">Reservation link</label>
                          <input
                            type="url"
                            value={reservationLinkEdit}
                            onChange={(e) => setReservationLinkEdit(e.target.value)}
                            placeholder="https://opentable.com/..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-0.5">Separate from ordering—OpenTable, Resy, etc.</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Catering link</label>
                          <input
                            type="url"
                            value={cateringLinkEdit}
                            onChange={(e) => setCateringLinkEdit(e.target.value)}
                            placeholder="https://yoursite.com/catering"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-0.5">URL for catering inquiries (shown when Catering is in special services)</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Order on our website</label>
                          <input
                            type="url"
                            value={deliveryLinksEdit.website_order}
                            onChange={(e) => setDeliveryLinksEdit(prev => ({ ...prev, website_order: e.target.value }))}
                            placeholder="https://yoursite.com/order"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-0.5">Direct link to order from your site (Toast, ChowNow, etc.)</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">DoorDash</label>
                          <input
                            type="url"
                            value={deliveryLinksEdit.doordash}
                            onChange={(e) => setDeliveryLinksEdit(prev => ({ ...prev, doordash: e.target.value }))}
                            placeholder="https://doordash.com/..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Uber Eats</label>
                          <input
                            type="url"
                            value={deliveryLinksEdit.uber_eats}
                            onChange={(e) => setDeliveryLinksEdit(prev => ({ ...prev, uber_eats: e.target.value }))}
                            placeholder="https://ubereats.com/..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Grubhub</label>
                          <input
                            type="url"
                            value={deliveryLinksEdit.grubhub}
                            onChange={(e) => setDeliveryLinksEdit(prev => ({ ...prev, grubhub: e.target.value }))}
                            placeholder="https://grubhub.com/..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                          />
                        </div>
                        {deliveryLinksEdit.custom.map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const u = [...deliveryLinksEdit.custom]
                                u[idx] = { ...u[idx], name: e.target.value }
                                setDeliveryLinksEdit(prev => ({ ...prev, custom: u }))
                              }}
                              placeholder="Platform (e.g. Toast)"
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                            />
                            <input
                              type="url"
                              value={item.url}
                              onChange={(e) => {
                                const u = [...deliveryLinksEdit.custom]
                                u[idx] = { ...u[idx], url: e.target.value }
                                setDeliveryLinksEdit(prev => ({ ...prev, custom: u }))
                              }}
                              placeholder="URL"
                              className="flex-[2] border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                            />
                            <button
                              type="button"
                              onClick={() => setDeliveryLinksEdit(prev => ({ ...prev, custom: prev.custom.filter((_, i) => i !== idx) }))}
                              className="px-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setDeliveryLinksEdit(prev => ({ ...prev, custom: [...prev.custom, { name: '', url: '' }] }))}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          + Add other platform
                        </button>
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Special services offered</label>
                          <div className="flex flex-wrap gap-3">
                            {specialServicesOptions.map(opt => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={specialServicesEdit.includes(opt)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSpecialServicesEdit(prev => [...prev, opt])
                                    else setSpecialServicesEdit(prev => prev.filter(s => s !== opt))
                                  }}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-900">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const payload: Record<string, string | Array<{ name: string; url: string }>> = {}
                            if (deliveryLinksEdit.website_order?.trim()) payload.website_order = deliveryLinksEdit.website_order.trim()
                            if (deliveryLinksEdit.doordash?.trim()) payload.doordash = deliveryLinksEdit.doordash.trim()
                            if (deliveryLinksEdit.uber_eats?.trim()) payload.uber_eats = deliveryLinksEdit.uber_eats.trim()
                            if (deliveryLinksEdit.grubhub?.trim()) payload.grubhub = deliveryLinksEdit.grubhub.trim()
                            const custom = deliveryLinksEdit.custom.filter(c => c.name?.trim() && c.url?.trim())
                            if (custom.length > 0) payload.custom = custom.map(c => ({ name: c.name.trim(), url: c.url.trim() }))
                            setEditedRestaurantInfo(prev => prev ? {
                              ...prev,
                              deliveryLinks: Object.keys(payload).length > 0 ? payload : null,
                              reservationLink: reservationLinkEdit?.trim() || null,
                              cateringLink: cateringLinkEdit?.trim() || null,
                              specialServices: specialServicesEdit.length > 0 ? specialServicesEdit : undefined
                            } : null)
                            setEditingDeliveryLinks(false)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            const dl = editedRestaurantInfo?.deliveryLinks
                            if (dl && typeof dl === 'object') {
                              setDeliveryLinksEdit({
                                website_order: (typeof dl.website_order === 'string' ? dl.website_order : '') || '',
                                doordash: (typeof dl.doordash === 'string' ? dl.doordash : '') || '',
                                uber_eats: (typeof dl.uber_eats === 'string' ? dl.uber_eats : '') || '',
                                grubhub: (typeof dl.grubhub === 'string' ? dl.grubhub : '') || '',
                                custom: Array.isArray(dl.custom) ? dl.custom : []
                              })
                            } else {
                              setDeliveryLinksEdit({ website_order: '', doordash: '', uber_eats: '', grubhub: '', custom: [] })
                            }
                            setReservationLinkEdit(editedRestaurantInfo?.reservationLink || '')
                            setCateringLinkEdit(editedRestaurantInfo?.cateringLink || '')
                            setSpecialServicesEdit(editedRestaurantInfo?.specialServices || [])
                            setEditingDeliveryLinks(false)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="text-gray-900 text-sm">
                          {(() => {
                            const dl = editedRestaurantInfo?.deliveryLinks
                            const rl = editedRestaurantInfo?.reservationLink
                            const cl = editedRestaurantInfo?.cateringLink
                            if ((!dl || (typeof dl === 'object' && Object.keys(dl).length === 0)) && !rl && !cl) return 'None added'
                            const parts: string[] = []
                            if (rl) parts.push('Reservation')
                            if (cl) parts.push('Catering')
                            if (dl && typeof dl === 'object') {
                              if (dl.website_order) parts.push('Our website')
                              if (dl.doordash) parts.push('DoorDash')
                              if (dl.uber_eats) parts.push('Uber Eats')
                              if (dl.grubhub) parts.push('Grubhub')
                              if (Array.isArray(dl.custom)) dl.custom.forEach((c: { name: string }) => { if (c?.name) parts.push(c.name) })
                            }
                            return parts.length > 0 ? parts.join(', ') : 'None added'
                          })()}
                        </div>
                        {(() => {
                          const svc = editedRestaurantInfo?.specialServices
                          if (!Array.isArray(svc) || svc.length === 0) return null
                          return (
                            <div className="text-gray-900 text-sm">
                              <span className="font-medium text-gray-700">Special services: </span>
                              {svc.join(', ')}
                            </div>
                          )
                        })()}
                      </div>
                      <button
                        onClick={() => {
                          const dl = editedRestaurantInfo?.deliveryLinks
                            if (dl && typeof dl === 'object') {
                              setDeliveryLinksEdit({
                                website_order: (typeof dl.website_order === 'string' ? dl.website_order : '') || '',
                                doordash: (typeof dl.doordash === 'string' ? dl.doordash : '') || '',
                                uber_eats: (typeof dl.uber_eats === 'string' ? dl.uber_eats : '') || '',
                                grubhub: (typeof dl.grubhub === 'string' ? dl.grubhub : '') || '',
                                custom: Array.isArray(dl.custom) ? dl.custom : []
                              })
                            } else {
                              setDeliveryLinksEdit({ website_order: '', doordash: '', uber_eats: '', grubhub: '', custom: [] })
                            }
                            setReservationLinkEdit(editedRestaurantInfo?.reservationLink || '')
                            setCateringLinkEdit(editedRestaurantInfo?.cateringLink || '')
                            setSpecialServicesEdit(editedRestaurantInfo?.specialServices || [])
                            setEditingDeliveryLinks(true)
                          }}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Menu Items with Prices</h3>
            <button
              onClick={handleAddItem}
              disabled={editingIndex !== null}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>
          
          {/* Group items by menu type if menu types exist */}
          {hasMenuTypes && Object.keys(groupedByMenuType).length > 0 ? (
            <>
              {Object.entries(groupedByMenuType).map(([menuType, menuItems]) => (
                <div key={menuType} className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
                    {menuType} Menu
                  </h4>
                  <div className="space-y-4 mb-6">
                    {menuItems.map((item, localIndex) => {
                      const index = item.originalIndex
                      return (
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
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
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
          )}

        {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No menu items to review. All items were removed.</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex flex-col items-end gap-2">
            {editingIndex !== null && (
              <p className="text-red-600 text-sm font-medium">
                Please save or cancel the item you are currently editing
              </p>
            )}
            {!onFieldSave ? (
              <button
                onClick={handleApprove}
                disabled={items.length === 0 || editingIndex !== null}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                Looks Good - Save Menu
              </button>
            ) : (
              <p className="text-sm text-gray-500">Changes save automatically when you click Save</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
