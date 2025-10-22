'use client'

import { useState } from 'react'
import { Settings, Save, Bot, Clock, MapPin, Phone, Mail, UtensilsCrossed, Plus, Edit2, Trash2, X, RefreshCw, Globe } from 'lucide-react'

export default function AdminPage() {
  const [websiteUrl, setWebsiteUrl] = useState('https://bellavista.com')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [showSyncModal, setShowSyncModal] = useState(false)
  
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Bella Vista Restaurant',
    hours: 'Mon-Fri: 11:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@bellavista.com',
    description: 'Fine dining with a modern twist, featuring fresh local ingredients and exceptional service.',
    specialties: 'Italian cuisine, fresh pasta, wood-fired pizza, extensive wine selection'
  })

  const [chatbotSettings, setChatbotSettings] = useState({
    welcomeMessage: 'Welcome to Bella Vista! How can I help you today?',
    personality: 'friendly and professional',
    responseStyle: 'helpful and informative'
  })

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Margherita Pizza',
      category: 'Main Course',
      description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
      price: 16.99,
      allergens: ['Gluten', 'Dairy'],
      dietaryTags: ['Vegetarian'],
      ingredients: 'Pizza dough, tomato sauce, fresh mozzarella, basil, olive oil',
      available: true
    },
    {
      id: 2,
      name: 'Caesar Salad',
      category: 'Appetizer',
      description: 'Crisp romaine lettuce with parmesan and house-made Caesar dressing',
      price: 12.99,
      allergens: ['Dairy', 'Fish'],
      dietaryTags: [],
      ingredients: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing, anchovies',
      available: true
    }
  ])

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null)
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'Appetizer',
    description: '',
    price: '',
    allergens: [] as string[],
    dietaryTags: [] as string[],
    ingredients: '',
    available: true
  })

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish']
  const allergenOptions = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Fish', 'Soy', 'Sesame']
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Low-Carb']

  const handleSave = () => {
    // In a real app, this would save to a database
    alert('Settings saved successfully!')
  }

  const openAddMenuItem = () => {
    setEditingMenuItem(null)
    setMenuForm({
      name: '',
      category: 'Appetizer',
      description: '',
      price: '',
      allergens: [],
      dietaryTags: [],
      ingredients: '',
      available: true
    })
    setIsMenuModalOpen(true)
  }

  const openEditMenuItem = (item: any) => {
    setEditingMenuItem(item)
    setMenuForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price.toString(),
      allergens: item.allergens,
      dietaryTags: item.dietaryTags,
      ingredients: item.ingredients,
      available: item.available
    })
    setIsMenuModalOpen(true)
  }

  const handleSaveMenuItem = () => {
    if (editingMenuItem) {
      // Update existing item
      setMenuItems(menuItems.map(item => 
        item.id === editingMenuItem.id 
          ? { ...item, ...menuForm, price: parseFloat(menuForm.price) }
          : item
      ))
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        ...menuForm,
        price: parseFloat(menuForm.price)
      }
      setMenuItems([...menuItems, newItem])
    }
    setIsMenuModalOpen(false)
    alert('Menu item saved successfully!')
  }

  const handleDeleteMenuItem = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id))
    }
  }

  const toggleAllergen = (allergen: string) => {
    setMenuForm({
      ...menuForm,
      allergens: menuForm.allergens.includes(allergen)
        ? menuForm.allergens.filter(a => a !== allergen)
        : [...menuForm.allergens, allergen]
    })
  }

  const toggleDietaryTag = (tag: string) => {
    setMenuForm({
      ...menuForm,
      dietaryTags: menuForm.dietaryTags.includes(tag)
        ? menuForm.dietaryTags.filter(t => t !== tag)
        : [...menuForm.dietaryTags, tag]
    })
  }

  const handleSyncWebsite = async () => {
    if (!websiteUrl.trim()) {
      setSyncMessage('Please enter a website URL')
      return
    }

    setIsSyncing(true)
    setSyncMessage('')

    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSyncMessage(data.error || 'Failed to sync website')
        setIsSyncing(false)
        return
      }

      // Update restaurant info with synced data
      if (data.data) {
        setRestaurantInfo({
          name: data.data.restaurantName || restaurantInfo.name,
          hours: data.data.hours || restaurantInfo.hours,
          address: data.data.address || restaurantInfo.address,
          phone: data.data.phone || restaurantInfo.phone,
          email: data.data.email || restaurantInfo.email,
          description: data.data.description || restaurantInfo.description,
          specialties: restaurantInfo.specialties
        })

        // Add/update menu items from synced data
        if (data.data.menuItems && data.data.menuItems.length > 0) {
          const newItems = data.data.menuItems.map((item: any, index: number) => ({
            id: Date.now() + index,
            name: item.name,
            category: item.category || 'Main Course',
            description: item.description,
            price: parseFloat(item.price) || 0,
            allergens: item.allergens || [],
            dietaryTags: item.dietaryTags || [],
            ingredients: item.ingredients || '',
            available: true
          }))
          setMenuItems([...menuItems, ...newItems])
        }

        setSyncMessage(`Successfully synced! Updated ${data.data.menuItems?.length || 0} menu items.`)
      }

      setIsSyncing(false)
      setTimeout(() => setShowSyncModal(false), 2000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncMessage('Failed to sync website. Please try again.')
      setIsSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    Restaurant Admin Dashboard
                  </h1>
                  <p className="text-primary-100 mt-2">
                    Manage your restaurant information and chatbot settings
                  </p>
                </div>
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  Sync from Website
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Restaurant Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <MapPin className="w-6 h-6" />
                  Restaurant Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>

              {/* Chatbot Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Bot className="w-6 h-6" />
                  Chatbot Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Welcome Message
                    </label>
                    <input
                      type="text"
                      value={chatbotSettings.welcomeMessage}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, welcomeMessage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personality
                    </label>
                    <select
                      value={chatbotSettings.personality}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, personality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    >
                      <option value="friendly and professional">Friendly and Professional</option>
                      <option value="casual and fun">Casual and Fun</option>
                      <option value="formal and elegant">Formal and Elegant</option>
                      <option value="warm and welcoming">Warm and Welcoming</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Style
                    </label>
                    <select
                      value={chatbotSettings.responseStyle}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, responseStyle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    >
                      <option value="helpful and informative">Helpful and Informative</option>
                      <option value="brief and direct">Brief and Direct</option>
                      <option value="detailed and comprehensive">Detailed and Comprehensive</option>
                      <option value="conversational and engaging">Conversational and Engaging</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Menu Management */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
                    <UtensilsCrossed className="w-6 h-6" />
                    Menu Management
                  </h2>
                  <button
                    onClick={openAddMenuItem}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Manage your menu items with detailed information including allergens, dietary tags, and ingredients. 
                  The chatbot uses this information to answer customer questions accurately.
                </p>

                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              {item.category}
                            </span>
                            <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                            {!item.available && (
                              <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          <div className="text-sm text-gray-500 mb-2">
                            <strong>Ingredients:</strong> {item.ingredients}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.allergens.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-red-600">Allergens:</span>
                                {item.allergens.map((allergen) => (
                                  <span key={allergen} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    {allergen}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.dietaryTags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-green-600">Dietary:</span>
                                {item.dietaryTags.map((tag) => (
                                  <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditMenuItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {menuItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No menu items yet. Click "Add Item" to create your first menu item.
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Item Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                      placeholder="16.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    placeholder="Describe the dish..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients *
                  </label>
                  <textarea
                    value={menuForm.ingredients}
                    onChange={(e) => setMenuForm({...menuForm, ingredients: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                    placeholder="List all ingredients, separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map(allergen => (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          menuForm.allergens.includes(allergen)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {allergen}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietaryTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          menuForm.dietaryTags.includes(tag)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={menuForm.available}
                      onChange={(e) => setMenuForm({...menuForm, available: e.target.checked})}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available (uncheck if temporarily unavailable)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveMenuItem}
                    disabled={!menuForm.name || !menuForm.price || !menuForm.description || !menuForm.ingredients}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {editingMenuItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary-600" />
                Sync from Website
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSyncing}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Enter your restaurant's website URL to automatically update menu items, hours, and contact information.
            </p>

            {syncMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                syncMessage.includes('Successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {syncMessage}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                placeholder="https://yourrestaurant.com"
                disabled={isSyncing}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSyncWebsite}
                disabled={isSyncing || !websiteUrl.trim()}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Sync Now
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSyncModal(false)}
                disabled={isSyncing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
