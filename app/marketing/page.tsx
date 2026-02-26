'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Bot, CheckCircle, Star, ArrowRight, Users, MessageSquare, TrendingUp, Zap, Clock, DollarSign, BarChart3, Shield, Headphones, Globe, Smartphone, Award, Target, ChevronRight, Settings, Crown, LayoutDashboard } from 'lucide-react'

export default function MarketingPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stats = [
    { number: '50%', label: 'Increase in Customer Conversion Rate on Website', icon: <TrendingUp className="w-8 h-8" /> },
    { number: '24/7', label: 'Customer Support Availability', icon: <Clock className="w-8 h-8" /> },
    { number: '40%', label: 'Reduction in Phone Calls', icon: <MessageSquare className="w-8 h-8" /> },
    { number: '$1,800', label: 'Average Monthly Revenue Increase', icon: <DollarSign className="w-8 h-8" /> }
  ]

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI-Powered Conversations',
      description: 'Intelligent chatbot that understands customer questions and provides helpful responses about your restaurant, menu, and services.',
      benefits: ['Natural language processing', 'Context-aware responses', 'Multi-language support']
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Customer Support',
      description: 'Never miss a customer inquiry. Your AI assistant is always available to help customers, even when you\'re closed.',
      benefits: ['Round-the-clock availability', 'Instant responses', 'No staffing costs']
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Drive More Visits & Revenue',
      description: 'Answer dietary questions, ingredient inquiries, and allergen concerns instantly—giving guests confidence to visit. When customers know you can accommodate their needs, they\'re more likely to choose your restaurant.',
      benefits: ['Build trust with dietary information', 'Convert browsers into diners', 'Increase reservation rates']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Full-Service Setup & Management',
      description: 'Our team handles everything for you. We set up your chatbot, personalize it based on your specific needs and menu, and maintain it as your restaurant evolves—so you can focus on running your business.',
      benefits: ['Full-service setup by our team', 'Personalized to your needs & menu', 'Ongoing maintenance included']
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Seamless Website Integration',
      description: 'Works perfectly on your restaurant\'s website and mobile experience with a single, straightforward integration.',
      benefits: ['Responsive website widgets', 'Mobile-optimized interface', 'Works with all major platforms']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Easy-to-Read Analytics',
      description: 'See exactly how your chatbot is performing with a clean, simple dashboard with analytics. Track what questions customers ask most, peak inquiry times, and ROI impact—all at a glance.',
      benefits: ['Simple visual reports', 'Customer conversation summaries', 'Clear, actionable metrics']
    }
  ]


  const pricingPlans = [
    {
      name: 'Beta',
      price: 'Free',
      period: 'During Beta',
      description: 'Full access to all features while we perfect the product',
      features: [
        'Unlimited messages',
        'Advanced chatbot with all features',
        'Custom integrations',
        'Custom interface and branding',
        'Tailored to your restaurant',
        'Priority support',
        'Analytics Dashboard',
        'User Dashboard',
        'Update menu, hours, specials and more',
        'Help shape the product'
      ],
      cta: 'Join Beta',
      popular: false
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Thank you for your interest! We\'ll be in touch soon.')
    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-primary-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">Front of House AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {status === 'authenticated' && session ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/marketing' })}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-primary-600">Login</Link>
                  <Link href="/signup" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                    Join Beta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Restaurant with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Deploy an intelligent chatbot personalized for your restaurant that increases customer conversion rate on your website by 50%, 
              reduces phone calls by 40%, provides 24/7 support for customers, and generates an average of $1,800 more revenue per month.
            </p>
            <div className="flex justify-center mb-12">
              <Link href="/demo" className="bg-white text-primary-600 px-12 py-4 rounded-lg font-semibold text-xl hover:bg-gray-100 flex items-center justify-center gap-3 shadow-lg">
                <Bot className="w-6 h-6" />
                Demo
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-primary-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free beta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Setup handled by our team</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Results</h2>
            <p className="text-lg text-gray-600">Join hundreds of restaurants already seeing dramatic improvements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg text-center">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI chatbot is specifically designed for restaurants, with features that drive real business results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See Your AI Chatbot in Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience how our AI chatbot works with real restaurant data. Try asking about hours, menu items, dietary options, or anything else!
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Demo Preview */}
              <div className="p-8 lg:p-12">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Try the Demo Options Now</h3>
                  <p className="text-gray-600 mb-6">
                    This is exactly how your customers will interact with your personalized AI assistant. 
                    Ask questions about menu items, hours, dietary restrictions, or anything else!
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">✨ What you can try:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• "What are your hours?"</li>
                      <li>• "Do you have vegetarian options?"</li>
                      <li>• "How do I make a reservation?"</li>
                      <li>• "Is this dish gluten-free?"</li>
                      <li>• "What's your phone number?"</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <a 
                    href="/demo" 
                    className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Bot className="w-5 h-5" />
                    Try Demo Options
                  </a>
                </div>
              </div>
              
              {/* Demo Screenshot/Preview */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 lg:p-12 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Restaurant Assistant</p>
                      <p className="text-xs text-gray-500">Powered by Front of House AI</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">Welcome! How can I help you today?</p>
                    </div>
                    <div className="bg-primary-600 text-white rounded-lg p-3 ml-8">
                      <p className="text-sm">What are your hours?</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">We're open Mon-Fri 11am-10pm, Sat-Sun 10am-11pm</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 text-center">Try the full demo to see more!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Beta Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">Join the Beta</h2>
            <p className="text-xl text-gray-300 mb-8">Be part of the wave of restaurants transforming their customer experience</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-900 mb-2">Absolutely Free</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-600 text-sm">Advanced chatbot with all features integrated</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Unlimited</h3>
                <p className="text-gray-600 text-sm">No message limits during beta</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customizable</h3>
                <p className="text-gray-600 text-sm">Full branding and customization handled by our team</p>
              </div>
            </div>

            <a 
              href="/signup"
              className="block w-full bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors text-center"
            >
              Join Beta Program
            </a>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Calculate Your Revenue Increase</h2>
            <p className="text-xl text-gray-600">See how much additional revenue you could generate with our AI chatbot</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How many people visit your website per month?
              </label>
              <input
                type="number"
                id="monthlyVisits"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of monthly visitors"
                style={{ color: '#111827' }}
                onChange={(e) => {
                  const visits = parseInt(e.target.value) || 0;
                  const partySize = 2.5;
                  const customersWithoutBot = visits * 0.10;
                  const customersWithBot = visits * 0.13; // Updated to 13% conversion rate
                  const withoutBot = customersWithoutBot * partySize;
                  const totalWithBot = customersWithBot * partySize;
                  const extraCustomers = totalWithBot - withoutBot;
                  const monthlyRevenue = extraCustomers * 18;
                  
                  const monthlyVisitsDisplay = document.getElementById('monthlyVisitsDisplay');
                  const monthlyVisitsDisplay2 = document.getElementById('monthlyVisitsDisplay2');
                  const customersWithoutBotEl = document.getElementById('customersWithoutBot');
                  const customersWithBotEl = document.getElementById('customersWithBot');
                  const withoutBotEl = document.getElementById('withoutBot');
                  const withBotEl = document.getElementById('withBot');
                  const extraCustomersEl = document.getElementById('extraCustomers');
                  const monthlyRevenueEl = document.getElementById('monthlyRevenue');
                  const monthlyRevenue2El = document.getElementById('monthlyRevenue2');

                  if (monthlyVisitsDisplay) monthlyVisitsDisplay.textContent = visits.toLocaleString();
                  if (monthlyVisitsDisplay2) monthlyVisitsDisplay2.textContent = visits.toLocaleString();
                  if (customersWithoutBotEl) customersWithoutBotEl.textContent = customersWithoutBot % 1 === 0 ? customersWithoutBot.toFixed(0) : customersWithoutBot.toFixed(1);
                  if (customersWithBotEl) customersWithBotEl.textContent = customersWithBot % 1 === 0 ? customersWithBot.toFixed(0) : customersWithBot.toFixed(1);
                  if (withoutBotEl) withoutBotEl.textContent = withoutBot % 1 === 0 ? withoutBot.toFixed(0) : withoutBot.toFixed(1);
                  if (withBotEl) withBotEl.textContent = totalWithBot % 1 === 0 ? totalWithBot.toFixed(0) : totalWithBot.toFixed(1);
                  if (extraCustomersEl) extraCustomersEl.textContent = extraCustomers % 1 === 0 ? extraCustomers.toFixed(0) : extraCustomers.toFixed(1);
                  if (monthlyRevenueEl) monthlyRevenueEl.textContent = `$${Math.round(monthlyRevenue).toLocaleString()}`;
                  if (monthlyRevenue2El) monthlyRevenue2El.textContent = `$${Math.round(monthlyRevenue).toLocaleString()}`;
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Current Situation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Monthly website visitors:</span>
                    <span className="font-semibold text-gray-900" id="monthlyVisitsDisplay">0</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Conversion Rate:</span>
                    <span className="font-semibold text-gray-900">10%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Customers:</span>
                    <span className="font-semibold text-gray-900" id="customersWithoutBot">0</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Average party size:</span>
                    <span className="font-semibold text-gray-900">2.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monthly Customers from website:</span>
                    <span className="font-semibold text-gray-900" id="withoutBot">0</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">With AI Chatbot</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Monthly website visitors:</span>
                    <span className="font-semibold text-gray-900" id="monthlyVisitsDisplay2">0</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Conversion Rate with Chatbot:</span>
                    <span className="font-semibold text-gray-900">13%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Customers:</span>
                    <span className="font-semibold text-gray-900" id="customersWithBot">0</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Average party size:</span>
                    <span className="font-semibold text-gray-900">2.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monthly Customers from Website:</span>
                    <span className="font-semibold text-green-600" id="withBot">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Revenue Impact Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-2" id="extraCustomers">0</div>
                    <p className="text-gray-600">Additional customers per month</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">$18</div>
                    <p className="text-gray-600">Average spend per person</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-2" id="monthlyRevenue">$0</div>
                    <p className="text-gray-600">Monthly revenue increase</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Your Monthly Revenue Increase</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2" id="monthlyRevenue2">$0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of restaurants already using our AI chatbot to serve customers better
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-primary-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 flex items-center justify-center gap-2 shadow-lg"
            >
              Join Beta
              <Zap className="w-5 h-5" />
            </a>
            <a
              href="/demo"
              className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5" />
              Try Interactive Demo
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-sm text-primary-200 mt-6">
            ✓ Free beta • ✓ Setup handled by our team • ✓ Priority support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="w-8 h-8 text-primary-400 mr-3" />
                <span className="text-2xl font-bold">Front of House AI</span>
              </div>
              <p className="text-gray-400">
                The leading AI chatbot solution for restaurants. Increase customer engagement, reduce costs, and boost revenue.
              </p>
            </div>
            
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Product</h3>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="#features" className="hover:text-white">Features</a></li>
                      <li><a href="#pricing" className="hover:text-white">Beta</a></li>
                      <li><a href="/support" className="hover:text-white">Support and FAQ</a></li>
                    </ul>
                  </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Front of House AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}