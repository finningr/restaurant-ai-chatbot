'use client'

import { useState, useEffect } from 'react'
import { Bot, Home, Phone, Mail, MapPin, Clock, Star, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [isChatExpanded, setIsChatExpanded] = useState(true)

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'minimize') setIsChatExpanded(false)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/marketing" className="text-2xl font-bold text-primary-600">
                Front of House AI
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/login" className="text-gray-600 hover:text-primary-600">Login</a>
              <Link href="/marketing" className="flex items-center text-gray-600 hover:text-primary-600">
                <Home className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <a href="/signup" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Join Beta
              </a>
            </div>
            <Link href="/marketing" className="flex items-center text-gray-500 hover:text-gray-700 md:hidden">
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Restaurant Website */}
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-6xl font-bold mb-6 tracking-tight">Azura Mediterranean Restaurant</h1>
              <p className="text-2xl mb-8 font-light">Authentic Mediterranean Cuisine in the Heart of Denver</p>
              <div className="flex items-center justify-center space-x-8 text-lg">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="font-semibold">247 Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-12 leading-tight text-center">About Us</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                Azura opened its doors in Denver in 2012, born from a family passion for Mediterranean cooking. Owner and head chef Maria Kostas grew up in a kitchen in Athens, where her grandmother taught her that the best meals come from simple ingredients, patience, and tradition.
              </p>
              <p>
                We source our olives, olive oil, and many specialty ingredients directly from small producers in Greece, Turkey, and Lebanon. Our lamb and seafood are local whenever possible, and we work with Colorado farms for seasonal vegetables. Every dish on our menu tells a story—whether it&apos;s the spanakopita recipe passed down four generations or the grilled halloumi we learned to prepare during summers in Cyprus.
              </p>
              <p>
                We believe dining is about connection: with family, with friends, and with the cultures that inspire our food. Come share a meal with us and taste the warmth of the Mediterranean, right here in the heart of Denver.
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Menu</h2>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto">Fresh ingredients, authentic flavors, unforgettable experiences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mezze & Appetizers */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-100">Mezze & Appetizers</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Hummus Trio</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$12</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Classic, roasted red pepper & garlic with warm pita</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Falafel Platter</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$14</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Crispy falafel, tahini, pickled vegetables</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Spanakopita</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$11</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Spinach & feta in phyllo, lemon zest</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Baba Ganoush</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$10</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Smoky eggplant dip with olive oil & herbs</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Mediterranean Bruschetta</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$10</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Tomato, basil, olive oil on grilled bread</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Grilled Halloumi</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$13</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Cypriot cheese, honey, walnuts</p>
                  </div>
                </div>
              </div>

              {/* Salads & Soups */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-100">Salads & Soups</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Greek Salad</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$12</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Tomatoes, cucumbers, olives, feta, oregano</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Mediterranean Quinoa Bowl</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$14</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Roasted vegetables, tahini dressing</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Lentil Soup</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$9</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Spiced red lentils, lemon, cilantro</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Chicken Shawarma Salad</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$16</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Shawarma, greens, pickles, garlic sauce</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Grilled Vegetable Platter</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$13</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Seasonal vegetables, balsamic glaze</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Avgolemono Soup</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$8</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Greek lemon-chicken rice soup</p>
                  </div>
                </div>
              </div>

              {/* Main Courses */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-100">Main Courses</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Lamb Kebab</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$24</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Grilled lamb, rice pilaf, grilled vegetables</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Chicken Shawarma</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$18</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Marinated chicken, garlic sauce, fresh veggies</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Mediterranean Seafood Platter</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$28</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Grilled fish, shrimp, calamari, lemon herb sauce</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Vegetarian Moussaka</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$16</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Layered eggplant, tomato sauce, béchamel</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Grilled Salmon</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$26</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Mediterranean herbs, quinoa, seasonal vegetables</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Lamb Shank</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$29</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Braised in tomato & wine, orzo, gremolata</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Pomegranate Glazed Lamb Chops</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$32</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Three chops, pomegranate reduction, couscous</p>
                  </div>
                </div>
              </div>

              {/* Desserts & Beverages */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-100">Desserts & Beverages</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Baklava</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$8</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Phyllo, honey, pistachios</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Turkish Coffee</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$4</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Traditional preparation</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Greek Yogurt & Honey</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$7</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">House-made yogurt, local honey, walnuts</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Fresh Lemonade</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$4</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Mint, house-made</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-gray-900 font-medium">Rosewater Pistachio Cake</span>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">$9</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Light sponge, cardamom cream</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Azura Mediterranean</h3>
                <p className="text-gray-300 mb-4">
                  Authentic Mediterranean cuisine in the heart of Denver.
                </p>
                <div className="flex items-center text-gray-300">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>4.8/5 stars on Google Reviews</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>info@azurarestaurant.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>123 Mediterranean Way, Denver, CO 80202</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Hours</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Monday-Thursday: 11am-10pm</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Friday-Saturday: 11am-11pm</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Sunday: 12pm-9pm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget - Intercom-style minimize/expand */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatExpanded ? (
          <div
            className="leading-[0]"
            style={{
              width: '350px',
              height: '600px',
              borderRadius: '12px',
              boxShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 32px',
              overflow: 'hidden',
              backgroundColor: '#0284c7'
            }}
          >
            <iframe
              src="/widget/demo?test=true"
              style={{
                border: 'none',
                display: 'block',
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                verticalAlign: 'top'
              }}
              title="Demo Chatbot Widget"
              allow="clipboard-read; clipboard-write"
              scrolling="no"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsChatExpanded(true)}
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center bg-primary-600 hover:bg-primary-700"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
