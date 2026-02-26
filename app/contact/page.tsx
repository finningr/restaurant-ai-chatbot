'use client'

import { Bot, Mail, Phone, MapPin, Clock, Send, MessageCircle, Video } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">Front of House AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">About Us</Link>
              <Link href="/contact" className="text-blue-600 font-medium relative">
                Contact
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></div>
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Login</Link>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Home</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Join Beta
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <MessageCircle className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Contact 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ready to transform your restaurant with AI? Let's discuss how we can help you 
              increase customer satisfaction and drive revenue growth.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="group relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                        placeholder="Your first name"
                        style={{ color: '#111827' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                        placeholder="Your last name"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="your@email.com"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="Your restaurant name"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-gray-900"
                      placeholder="Tell us about your restaurant and how we can help..."
                      style={{ color: '#111827' }}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Send Message */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-8 border border-emerald-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center mr-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Send us a Message</h3>
                      <p className="text-gray-600">Use the form to the left to contact us</p>
                    </div>
                  </div>
                  <p className="text-emerald-500 font-medium">
                    Fill out the contact form for a quick response
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl p-8 border border-cyan-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Email Us</h3>
                      <p className="text-gray-600">Get a response within 24 hours</p>
                    </div>
                  </div>
                  <a href="mailto:hello@restaurantai.com" className="text-cyan-500 hover:text-cyan-600 font-medium">
                    hello@restaurantai.com
                  </a>
                </div>
              </div>

              {/* Virtual Meeting */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-300 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-8 border border-violet-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center mr-4">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Schedule a Meeting</h3>
                      <p className="text-gray-600">Book a personalized demo</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:hello@restaurantai.com?subject=Schedule Virtual Meeting&body=Hi, I'd like to schedule a virtual meeting to discuss my restaurant's AI chatbot needs. Please let me know your available times."
                    className="text-violet-500 hover:text-violet-600 font-medium"
                  >
                    Schedule Virtual Meeting
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-xl flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Our Location</h3>
                      <p className="text-gray-600">Based in Denver, Colorado</p>
                    </div>
                  </div>
                  <p className="text-indigo-500 font-medium">
                    Denver, Colorado, USA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Clock className="w-4 h-4 mr-2" />
              Quick Answers
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get quick answers to common questions about our AI chatbot service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How quickly can you set up my chatbot?</h3>
              <p className="text-gray-600">We typically complete the setup within 24-48 hours. You'll receive an email once your chatbot is ready to go live.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What information do you need from my restaurant?</h3>
              <p className="text-gray-600">We need your menu, hours, contact information, dietary information, allergy safety protocols, events, religious elements, catering options, and specials.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Can I customize my chatbot's responses?</h3>
              <p className="text-gray-600">Yes! During the beta, our team will work as much or as little as you would like to customize responses, add special instructions, and ensure the chatbot reflects your restaurant's personality.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What if the chatbot gives incorrect information?</h3>
              <p className="text-gray-600">Our chatbot is highly accurate and thoroughly tested using a hybrid closed and open data system to ensure all information is correct. A 100% accurate chatbot is our priority.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl font-bold text-white mb-8">Ready to Get Started?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join our beta program and experience the future of restaurant customer service with AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
              Join Beta Program
            </Link>
            <Link href="/support" className="border-2 border-white text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105">
              Get Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
