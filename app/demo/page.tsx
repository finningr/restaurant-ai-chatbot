'use client'

import { useState } from 'react'
import { Bot, Globe, ArrowRight, ExternalLink, Home } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const validateUrl = (url: string) => {
    const urlPattern = /^https?:\/\/.+\..+/
    return urlPattern.test(url)
  }

  const handleCreateCustomChatbot = () => {
    if (!url.trim()) {
      setUrlError('Please enter a website URL')
      return
    }

    if (!validateUrl(url.trim())) {
      setUrlError('Please enter a valid URL (e.g., https://your-restaurant.com)')
      return
    }

    setUrlError('')
    // Navigate to onboarding with URL parameter
    window.location.href = `/onboarding?url=${encodeURIComponent(url.trim())}&autoExtract=true`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">RestaurantAI</span>
              </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/login" className="text-gray-600 hover:text-primary-600">Login</a>
              <Link 
                href="/marketing"
                className="flex items-center text-gray-600 hover:text-primary-600"
              >
                <Home className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <a href="/signup" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Join Beta
              </a>
            </div>
            <Link 
              href="/marketing" 
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors md:hidden"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>
        </div>
            </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Try Our AI Chatbot Demos
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Experience how our AI chatbot works with real restaurant data. Choose between creating a custom chatbot for your own restaurant or try a premade chatbot for our own sample restaurant.
          </p>
        </div>

        {/* Demo Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Option 1: Custom Chatbot */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Globe className="w-10 h-10 text-white" />
                </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Custom Chatbot</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Enter your restaurant's website URL and our AI will automatically extract your restaurant's information and create a custom chatbot preview for you!
              </p>
          </div>

            <div className="space-y-5 mb-8">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Try asking about menu items, hours, and dietary options</span>
                </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Preview your chatbot on your actual website</span>
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Set up in 2 minutes</span>
          </div>
        </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="website-url" className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Restaurant's Website URL
                </label>
                <input
                  type="url"
                  id="website-url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (urlError) setUrlError('')
                  }}
                  placeholder="https://your-restaurant.com"
                  className={`w-full border-2 rounded-xl px-5 py-4 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    urlError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                {urlError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {urlError}
                  </p>
                )}
        </div>

              <button
                onClick={handleCreateCustomChatbot}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="w-6 h-6" />
                Create Custom Chatbot
              </button>
            </div>
          </div>
          
          {/* Option 2: Mediterranean Demo */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
                      </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Try Our Restaurant Demo</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Experience our AI chatbot with a Mediterranean restaurant. Ask questions about their menu, hours, dietary options, and more!
              </p>
        </div>

            <div className="space-y-5 mb-8">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Try asking about menu items, hours, and dietary options</span>
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Experience realistic restaurant interactions</span>
            </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4"></div>
                <span className="text-sm font-medium">Interact with our restaurant website with our fully functional chatbot</span>
                  </div>
                </div>
                
            <Link 
              href="/mediterranean-demo"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="w-6 h-6" />
              Try Our Restaurant Demo
            </Link>
                </div>
              </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
              >
                Join Beta Program
              </Link>
              <Link 
                href="/marketing"
                className="border-2 border-primary-600 text-primary-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all"
              >
                Learn More
          </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}