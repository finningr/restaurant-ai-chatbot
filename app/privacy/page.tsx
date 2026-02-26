'use client'

import { Bot } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/marketing" className="flex items-center hover:opacity-80 transition-opacity">
            <Bot className="w-8 h-8 text-primary-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">Front of House AI</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">
              When you interact with our restaurant chatbot, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Conversation Data:</strong> All messages you send and receive through the chatbot</li>
              <li><strong>Session Information:</strong> A unique session identifier to track your conversation</li>
              <li><strong>Restaurant Context:</strong> The restaurant you are chatting with (identified by widget ID)</li>
              <li><strong>Menu Interactions:</strong> Information about which menu items you inquire about</li>
              <li><strong>Technical Data:</strong> Response times and technical metrics to improve our service</li>
              <li><strong>Usage Data:</strong> How you interact with the chatbot (questions asked, features used)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To provide and improve our chatbot service</li>
              <li>To respond to your questions and provide restaurant information</li>
              <li>To analyze chatbot performance and improve responses</li>
              <li>To generate analytics and insights for restaurant account managers</li>
              <li>To ensure the security and proper functioning of our service</li>
              <li>To train and improve our AI models for better customer service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-700 mb-3">
              Your conversation data is stored securely in our database. We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="text-gray-700">
              Data is retained for as long as necessary to provide our services and for legitimate business purposes, including analytics and service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 mb-3">
              We share your conversation data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Restaurant Account Managers:</strong> The restaurant you are chatting with has access to conversation logs and analytics for their location</li>
              <li><strong>Service Providers:</strong> We use third-party services (like OpenAI for AI responses) that process your messages to generate chatbot responses</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Access:</strong> Request access to your conversation data</li>
              <li><strong>Deletion:</strong> Request deletion of your conversation data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Opt-Out:</strong> Stop using the chatbot at any time</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, please contact us at <a href="mailto:privacy@restaurantai.com" className="text-primary-600 hover:underline">privacy@restaurantai.com</a> with your session ID (found in the chatbot footer) or approximate date/time of your conversation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Consent</h2>
            <p className="text-gray-700 mb-3">
              By using our chatbot, you consent to the collection, storage, and processing of your conversation data as described in this Privacy Policy. Your use of the chatbot constitutes your agreement to this policy.
            </p>
            <p className="text-gray-700">
              If you do not agree with this Privacy Policy, please do not use the chatbot.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: <a href="mailto:privacy@restaurantai.com" className="text-primary-600 hover:underline">privacy@restaurantai.com</a>
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link 
            href="/marketing" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

