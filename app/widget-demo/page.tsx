'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Code, Settings } from 'lucide-react'

export default function WidgetDemoPage() {
  const [widgetId, setWidgetId] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get widget ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id') || localStorage.getItem('lastWidgetId') || ''
    setWidgetId(id)
    
    if (id) {
      generateEmbedCode(id)
    }
  }, [])

  const generateEmbedCode = (id: string) => {
    const baseUrl = window.location.origin
    const code = `<script src="${baseUrl}/widget.js?id=${id}" async></script>`
    setEmbedCode(code)
    localStorage.setItem('lastWidgetId', id)
  }

  const handleWidgetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value
    setWidgetId(id)
    if (id) {
      generateEmbedCode(id)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const testWidget = () => {
    if (widgetId) {
      window.open(`/embed?id=${widgetId}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Widget Embed Code Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate embed codes for your restaurant chatbot
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* Widget ID Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Widget ID
            </label>
            <input
              type="text"
              value={widgetId}
              onChange={handleWidgetIdChange}
              placeholder="Enter your widget ID (e.g., restaurant-1234567890)"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              You can find your widget ID in the database or after creating a restaurant.
            </p>
          </div>

          {/* Embed Code */}
          {embedCode && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Embed Code
              </label>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Copy this code and paste it into your website's HTML before the closing &lt;/body&gt; tag.
              </p>
            </div>
          )}

          {/* Platform Instructions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Platform Instructions</h3>
            
            {/* WordPress */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">WordPress</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Method 1 - Theme Editor:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to Appearance → Theme Editor</li>
                  <li>Select your active theme</li>
                  <li>Click on "footer.php"</li>
                  <li>Paste the embed code before &lt;/body&gt;</li>
                  <li>Click "Update File"</li>
                </ol>
                
                <p><strong>Method 2 - Plugin:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Install "Insert Headers and Footers" plugin</li>
                  <li>Go to Settings → Insert Headers and Footers</li>
                  <li>Paste the embed code in "Footer" section</li>
                  <li>Click "Save"</li>
                </ol>
              </div>
            </div>

            {/* Wix */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Wix</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to your Wix Editor</li>
                  <li>Click on "Settings" in the left panel</li>
                  <li>Click on "Custom Code"</li>
                  <li>Click "Add Custom Code"</li>
                  <li>Paste the embed code</li>
                  <li>Set placement to "Body - End"</li>
                  <li>Click "Apply"</li>
                </ol>
              </div>
            </div>

            {/* Custom HTML */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Custom HTML/Other Platforms</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Simply paste the embed code before the closing &lt;/body&gt; tag in your HTML:</p>
                <div className="bg-gray-100 rounded-lg p-3 font-mono text-xs">
                  &lt;body&gt;<br />
                  &nbsp;&nbsp;&lt;!-- Your website content --&gt;<br />
                  &nbsp;&nbsp;{embedCode}<br />
                  &lt;/body&gt;
                </div>
              </div>
            </div>
          </div>

          {/* Test Widget */}
          {widgetId && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={testWidget}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Test Widget
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Click to open the widget in a new tab for testing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
