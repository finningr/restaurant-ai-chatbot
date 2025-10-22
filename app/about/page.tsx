'use client'

import { Bot, Target, Lightbulb, Heart, Code, DollarSign, Users, Award, Sparkles, TrendingUp, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">RestaurantAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-blue-600 font-medium relative">
                About Us
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
              <Sparkles className="w-4 h-4 mr-2" />
              Meet the Founders
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              About Our 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Meet the innovative founders behind RestaurantAI, revolutionizing how restaurants 
              connect with their customers through intelligent AI technology.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Finn Rourke */}
            <div className="group relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center mb-10">
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-lg opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Code className="w-20 h-20 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-3">Finn Rourke</h3>
                  <p className="text-2xl text-blue-600 font-semibold mb-6">Co-CEO & CTO</p>
                  <div className="flex justify-center space-x-3 mb-8">
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">AI/ML Expert</span>
                    <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">Tech Leader</span>
                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">Innovation</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Technical visionary with deep expertise in artificial intelligence, machine learning, and restaurant technology. 
                  Finn leads our product development with a passion for creating intelligent solutions that help restaurants 
                  thrive in the digital age. His background in cutting-edge AI technologies drives our innovation.
                </p>
              </div>
            </div>

            {/* Braeden Lawler */}
            <div className="group relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center mb-10">
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full blur-lg opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <DollarSign className="w-20 h-20 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-3">Braeden Lawler</h3>
                  <p className="text-2xl text-green-600 font-semibold mb-6">Co-CEO & CFO</p>
                  <div className="flex justify-center space-x-3 mb-8">
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Business Strategy</span>
                    <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">Restaurant Expert</span>
                    <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">Growth</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Business strategist and financial expert with extensive experience in the restaurant industry. 
                  Braeden focuses on sustainable growth strategies and helping restaurants maximize their revenue potential. 
                  His deep understanding of restaurant operations drives our customer-centric approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Globe className="w-4 h-4 mr-2" />
              Our Journey
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-12">Our Story</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 border border-white/20">
              <p className="text-2xl text-gray-600 leading-relaxed">
                RestaurantAI was born from a simple observation: restaurants were losing customers due to 
                poor online experiences and lack of 24/7 support. As technology leaders, we saw an opportunity 
                to revolutionize how restaurants interact with their customers using AI. Our mission is to 
                democratize advanced AI technology, making it accessible and affordable for restaurants of all sizes. 
                We believe every restaurant deserves the tools to compete in the digital age.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Heart className="w-4 h-4 mr-2" />
              Our Foundation
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Foundation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-10 border border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To empower every restaurant with intelligent AI technology that increases customer satisfaction, 
                  drives revenue growth, and reduces operational costs. We're making advanced AI accessible 
                  to restaurants of all sizes.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-10 border border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  A future where every restaurant has access to intelligent AI assistants that provide 
                  exceptional customer service, drive sales, and create meaningful connections between 
                  restaurants and their customers 24/7.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-10 border border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Innovation:</strong> We push the boundaries of what's possible with AI technology.</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Accessibility:</strong> We make advanced AI affordable for restaurants of all sizes.</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Reliability:</strong> We build solutions that restaurants can depend on 24/7.</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Partnership:</strong> We work closely with restaurants to understand their unique needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl font-bold text-white mb-8">Ready to Transform Your Restaurant?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join our beta program and experience the future of restaurant customer service with AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
              Join Beta Program
            </Link>
            <Link href="/support" className="border-2 border-white text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
