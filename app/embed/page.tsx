'use client'

import { useState } from 'react'
import { Copy, Check, Code, Globe, Smartphone, Monitor } from 'lucide-react'

export default function EmbedPage() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('default')
  const [selectedPosition, setSelectedPosition] = useState('bottom-right')

  const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const styles = [
    { id: 'default', name: 'Default', description: 'Clean and professional' },
    { id: 'modern', name: 'Modern', description: 'Sleek and contemporary' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and clean' },
    { id: 'colorful', name: 'Colorful', description: 'Bright and engaging' }
  ]

  const positions = [
    { id: 'bottom-right', name: 'Bottom Right', description: 'Traditional placement' },
    { id: 'bottom-left', name: 'Bottom Left', description: 'Alternative placement' },
    { id: 'center', name: 'Center', description: 'Floating center' },
    { id: 'inline', name: 'Inline', description: 'Embedded in page' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Integrate Your AI Chatbot
              </h1>
              <p className="text-gray-600 text-lg">
                Add your restaurant AI chatbot to your website in just a few clicks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Customize Your Chatbot</h2>
              
              {/* Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose a Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 border-2 rounded-lg text-left ${
                        selectedStyle === style.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {positions.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => setSelectedPosition(position.id)}
                      className={`p-3 border-2 rounded-lg text-left ${
                        selectedPosition === position.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{position.name}</div>
                      <div className="text-sm text-gray-600">{position.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Brand Colors
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
                    <input
                      type="color"
                      defaultValue="#0ea5e9"
                      className="w-full h-10 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                    <input
                      type="color"
                      defaultValue="#ffffff"
                      className="w-full h-10 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-sm text-gray-700">Show welcome message</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-sm text-gray-700">Enable typing indicators</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm text-gray-700">Collect user email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm text-gray-700">Enable file uploads</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview and Code */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="mb-4">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Website</h3>
                  <p className="text-gray-600 mb-4">
                    This is how your chatbot will appear on your website
                  </p>
                  
                  {/* Mock Chatbot */}
                  <div className="relative">
                    <div className="bg-primary-600 text-white p-4 rounded-lg shadow-lg max-w-xs mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm">🤖</span>
                        </div>
                        <span className="font-medium">AI Assistant</span>
                      </div>
                      <p className="text-sm">Hi! How can I help you today?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embed Code */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
                <p className="text-gray-600 mb-4">
                  Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag.
                </p>
                
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 text-sm font-medium">JavaScript</span>
                    <button
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Quick Setup Instructions:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Copy the code above</li>
                    <li>2. Paste it into your website's HTML</li>
                    <li>3. Save and publish your website</li>
                    <li>4. Your chatbot will appear automatically!</li>
                  </ol>
                </div>
              </div>

              {/* Platform Instructions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Platform-Specific Instructions</h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">WordPress</h3>
                    <p className="text-sm text-gray-600">
                      Go to Appearance → Theme Editor → footer.php and paste the code before &lt;/body&gt;
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Shopify</h3>
                    <p className="text-sm text-gray-600">
                      Go to Online Store → Themes → Actions → Edit Code → theme.liquid and paste before &lt;/body&gt;
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Wix</h3>
                    <p className="text-sm text-gray-600">
                      Go to Settings → Custom Code → Add Code to Head and paste the code
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Squarespace</h3>
                    <p className="text-sm text-gray-600">
                      Go to Settings → Advanced → Code Injection → Footer and paste the code
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Need Help with Integration?</h2>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you get your chatbot up and running
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
                  Contact Support
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
