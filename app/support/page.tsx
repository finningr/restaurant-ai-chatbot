'use client'

import { ArrowLeft, Mail, MessageCircle, Clock, Video } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">Front of House AI</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join Beta
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600">We're here to help you get the most out of your AI chatbot</p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <Mail className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get help via email. We respond within 24 hours during business days.
            </p>
            <a 
              href="mailto:support@restaurantai.com" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              support@restaurantai.com
            </a>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <Video className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Virtual Meeting</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Schedule a one-on-one session with our team to discuss your chatbot setup and customization.
            </p>
            <a 
              href="mailto:support@restaurantai.com?subject=Schedule Virtual Meeting&body=Hi, I'd like to schedule a virtual meeting to discuss my chatbot setup. Please let me know your available times." 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Schedule Meeting
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get quick answers to common questions about our AI chatbot service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How do I get started with the beta?</h3>
              <p className="text-gray-600">
                Simply sign up for our beta program and our team will handle the setup for you. 
                We'll extract your restaurant information and customize your chatbot within 24-48 hours.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Is there any cost for the beta program?</h3>
              <p className="text-gray-600">
                No, the beta program is completely free! You get full access to all features and our team handles all setup and provides priority support at no cost.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What information do you need from my restaurant?</h3>
              <p className="text-gray-600">
                We'll handle everything for you! Our team extracts everything from your website. Only thing we need from you is anything not on your website such as safety protocols.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How long does setup take?</h3>
              <p className="text-gray-600">
                Our team completes the setup within 24-48 hours. You'll receive an email 
                once your chatbot is ready to go live.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Can I customize my chatbot's responses?</h3>
              <p className="text-gray-600">
                Yes! During the beta, our team will work as much or as little as you would like to customize responses, add special 
                instructions, and ensure the chatbot reflects your restaurant's personality.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What if the chatbot gives incorrect information?</h3>
              <p className="text-gray-600">
                Our chatbot is highly accurate and thoroughly tested. If any mistake occurs, it's immediately flagged and corrected. 
                A 100% accurate chatbot is our priority.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Support Hours</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Monday - Friday: 9:00 AM - 6:00 PM MST<br />
            Saturday & Sunday: Closed
          </p>
          <p className="text-sm text-gray-500">
            We're committed to providing priority support to all participants.
          </p>
        </section>
      </div>
    </div>
  )
}
