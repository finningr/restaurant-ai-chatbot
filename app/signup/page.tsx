'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bot, Home } from 'lucide-react'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/invite/restaurant-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invite')
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
              <div>
                <span className="text-2xl font-bold text-gray-900">Front of House AI</span>
                <p className="text-xs text-gray-500">Join Beta</p>
              </div>
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
              className="flex items-center text-gray-500 hover:text-gray-700 md:hidden"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Beta as a Restaurant Account Manager</h1>
              <p className="text-gray-600">
                Enter your details and we&apos;ll send you an email to create your account.
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg">
                  <p className="font-medium">Check your email!</p>
                  <p className="text-sm mt-1">
                    We sent a link to <strong>{formData.email}</strong>. Click it to create your password and finish setting up your account.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Didn&apos;t get the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => { setSuccess(false); setFormData({ name: '', email: '' }) }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    try again
                  </button>.
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center py-3 px-4 rounded-lg border border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isLoading ? 'Sending...' : 'Send Me the Signup Link'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
