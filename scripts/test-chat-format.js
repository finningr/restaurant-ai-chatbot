/**
 * Test chat API - format/UX validation
 * Run with dev server: npm run dev
 * Then: node scripts/test-chat-format.js
 * Or: WIDGET_ID=restaurant-xxx node scripts/test-chat-format.js
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let WIDGET_ID = process.env.WIDGET_ID

const TEST_QUESTIONS = [
  // Basic
  'hi',
  'hello',
  'What are your hours?',
  'Where are you located?',
  'What\'s your phone number?',
  'Do you take reservations?',
  // Menu - broad
  'Tell me about your menu',
  'What type of food do you serve?',
  'What do you have?',
  // Menu - specific
  'What tacos do you have?',
  'What\'s in the Pioneer burger?',
  'How much is the guacamole?',
  'Tell me about the birria tacos',
  // Dietary
  'Do you have vegan options?',
  'I have a nut allergy, what can I eat?',
  'Gluten free options?',
  'Anything vegetarian?',
  // Allergy-specific (should get allergy disclaimers + safe items only)
  'Shellfish allergy - what is safe?',
  'I\'m allergic to tree nuts',
  'Do you have dairy-free options? I\'m lactose intolerant',
  'What can I eat if I have a shellfish allergy?',
  // Recommendations
  'What do you recommend?',
  'What\'s popular?',
  'Best thing on the menu?',
  // Off-topic
  'What\'s 2+2?',
  'Tell me a joke',
  'What\'s the weather?',
  'Who won the election?',
  // Edge cases
  'Do you have profitable dishes?', // should redirect
  'What are your most high-margin items?', // should redirect
  'What restaurant is this?', // only time to say name
  'burger', // short follow-up
  'thanks',
  'Do you have outdoor seating?', // may not be in data
  'When is happy hour?',
  // Round 3 - additional edge cases
  'What about the margarita?',
  'Is the queso good?',
  'Do you deliver?',
  'Can I order online?',
  'Do you have a kids menu?',
  'What sizes do the drinks come in?',
  'Tell me about dietary accommodations', // vague - can ask back
  'recommend something cheap',
  'something under $10',
  'What\'s your address?', // synonym for location
  'budget-friendly options',
]

// Multi-turn conversations (user message, bot reply, user message, ...)
const TEST_CONVERSATIONS = [
  {
    label: 'Menu overview → Falafel details → Price',
    messages: [
      'Tell me about your menu',
      'What about the falafel?',
      'How much is it?'
    ]
  },
  {
    label: 'Vegan options → Follow-up on one item',
    messages: [
      'Do you have vegan options?',
      'Tell me more about the hummus'
    ]
  },
  {
    label: 'Recommendation → What goes well with it?',
    messages: [
      'What do you recommend?',
      'What goes well with that?'
    ]
  },
  {
    label: 'Hours → Location → Phone (multi-topic)',
    messages: [
      'What are your hours?',
      'Where are you located?',
      'What\'s your phone number?'
    ]
  },
  {
    label: 'Dietary vague → Specify type',
    messages: [
      'Tell me about dietary accommodations',
      'I need gluten-free options'
    ]
  },
  {
    label: 'Dietary → Nuts (treat as allergy)',
    messages: [
      'Tell me about dietary accommodations',
      'nuts'
    ]
  },
  {
    label: 'Dietary → Gluten (treat as allergy)',
    messages: [
      'What dietary options do you have?',
      'gluten'
    ]
  },
  {
    label: 'Dietary → Lactose (treat as allergy)',
    messages: [
      'Tell me about dietary accommodations',
      'lactose'
    ]
  },
  {
    label: 'Nut allergy → Follow-up on one item',
    messages: [
      'I have a nut allergy, what can I eat?',
      'Tell me more about the hummus'
    ]
  },
  {
    label: 'Item not on menu → Alternative request',
    messages: [
      'Do you have tacos?',
      'What sandwiches do you have instead?'
    ]
  },
  {
    label: 'Thanks / closure',
    messages: [
      'What do you have?',
      'thanks'
    ]
  },
  // --- Additional multi-round, human-like flows ---
  {
    label: 'Drinks → which have caffeine (intro must say "with caffeine")',
    messages: [
      'drinks',
      'which ones have caffeine?'
    ]
  },
  {
    label: 'Recommendation → price of first one',
    messages: [
      'What do you recommend?',
      'How much is the first one?'
    ]
  },
  {
    label: 'Hours → open tonight?',
    messages: [
      'What are your hours?',
      'Are you open tonight?'
    ]
  },
  {
    label: 'Location → how to get there',
    messages: [
      'Where are you located?',
      'How do I get there from downtown?'
    ]
  },
  {
    label: 'Appetizers → recommend one',
    messages: [
      'What appetizers do you have?',
      'Which one do you recommend?'
    ]
  },
  {
    label: 'Entrees → any under $20',
    messages: [
      'What entrees do you have?',
      'Any under $20?'
    ]
  },
  {
    label: 'Hi → then recommendation',
    messages: [
      'hi',
      'what do you recommend?'
    ]
  },
  {
    label: 'Delivery → whats the link',
    messages: [
      'Do you deliver?',
      "What's the link?"
    ]
  },
  {
    label: 'Nut allergy → is hummus safe',
    messages: [
      'I have a nut allergy',
      'Is the hummus safe?'
    ]
  },
  {
    label: 'Desserts → price of one',
    messages: [
      'What desserts do you have?',
      'How much is the baklava?'
    ]
  },
  {
    label: 'Lamb shanks → gluten free?',
    messages: [
      'Tell me about the lamb shanks',
      'Is it gluten free?'
    ]
  },
  {
    label: 'Drinks → any without caffeine',
    messages: [
      'What do you have for drinks?',
      'Any without caffeine?'
    ]
  },
  {
    label: 'Reservations → do you have a link',
    messages: [
      'Can I make a reservation?',
      'Do you have a link to book online?'
    ]
  },
  {
    label: 'Recommendation → tell me more about second one',
    messages: [
      'What do you recommend?',
      'Tell me more about the second one'
    ]
  },
  {
    label: 'Vegan → price of first',
    messages: [
      'Do you have vegan options?',
      "What's the price of the first one?"
    ]
  },
  {
    label: '4-turn: menu → entrees → recommend → price',
    messages: [
      'Tell me about your menu',
      'What entrees do you have?',
      'Which entree do you recommend?',
      'How much is it?'
    ]
  },
  {
    label: '3-turn: dietary vague → nuts → safe item detail',
    messages: [
      'Tell me about dietary',
      'nuts',
      'Tell me more about the falafel'
    ]
  },
  {
    label: 'Recommend desserts → what goes well with that',
    messages: [
      'What desserts do you recommend?',
      'What goes well with that?'
    ]
  },
  {
    label: 'Under $10 → which are vegan',
    messages: [
      'Something under $10',
      'Which of those are vegan?'
    ]
  }
]

async function fetchWidgetData() {
  const res = await fetch(`${BASE_URL}/api/widget/${WIDGET_ID}?test=true`)
  if (!res.ok) throw new Error(`Widget fetch failed: ${res.status}`)
  return res.json()
}

async function sendChatMessage(widgetData, message, conversationHistory = []) {
  const r = widgetData.restaurant || widgetData
  const menuItems = widgetData.menuItems || []
  let restaurantContext = `Restaurant: ${r.name}
Description: ${r.description || ''}
Phone: ${r.phone || ''}
Email: ${r.email || ''}
Address: ${r.address_street || ''}, ${r.address_city || ''}, ${r.address_state || ''} ${r.address_zip || ''}
Hours: ${JSON.stringify(r.hours || {})}
Cuisine: ${r.cuisine || ''}
Price Range: ${r.price_range || ''}`
  const links = r.delivery_links || {}
  if (r.reservation_link) restaurantContext += `\nReservation Link: ${r.reservation_link}`
  if (links && Object.keys(links).length > 0) {
    const parts = []
    if (links.website_order) parts.push(`Order on our website: ${links.website_order}`)
    if (links.doordash) parts.push(`DoorDash: ${links.doordash}`)
    if (links.uber_eats) parts.push(`Uber Eats: ${links.uber_eats}`)
    if (links.grubhub) parts.push(`Grubhub: ${links.grubhub}`)
    if (Array.isArray(links.custom)) links.custom.forEach(c => { if (c?.name && c?.url) parts.push(`${c.name}: ${c.url}`) })
    if (parts.length > 0) restaurantContext += `\nOrdering/Reservation Links:\n${parts.join('\n')}`
  }
  const svc = r.special_services
  if (Array.isArray(svc) && svc.length > 0) {
    restaurantContext += `\nSpecial Services Offered: ${svc.join(', ')}`
  }

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      widget_id: WIDGET_ID,
      session_id: `test-${Date.now()}`,
      restaurantContext,
      menuData: menuItems,
      conversationHistory: conversationHistory.map(m => ({ isUser: m.isUser, text: m.text })),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Chat failed: ${res.status}`)
  }
  const data = await res.json()
  return data.response
}

async function getLatestWidgetId() {
  const res = await fetch(`${BASE_URL}/api/restaurants`)
  if (!res.ok) throw new Error('Failed to fetch restaurants')
  const restaurants = await res.json()
  if (!restaurants?.length) throw new Error('No restaurants found. Create one via manual input first.')
  const latest = restaurants[0]
  console.log(`Using restaurant: ${latest.name} (${latest.widget_id})`)
  return latest.widget_id
}

async function run() {
  if (!WIDGET_ID) {
    console.log('No WIDGET_ID provided, fetching latest restaurant...')
    WIDGET_ID = await getLatestWidgetId()
  }
  console.log('Fetching widget data...')
  const widgetData = await fetchWidgetData()
  const r = widgetData.restaurant || widgetData
  console.log(`Restaurant: ${r.name}`)
  console.log('')

  const singleResults = []
  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const q = TEST_QUESTIONS[i]
    const label = typeof q === 'string' ? q : q.label || q.question
    const question = typeof q === 'string' ? q : q.question
    console.log(`\n--- SINGLE [${i + 1}/${TEST_QUESTIONS.length}] ${label} ---`)
    try {
      const response = await sendChatMessage(widgetData, question)
      console.log(response?.slice(0, 500) + (response?.length > 500 ? '...' : ''))
      singleResults.push({ question: label, response })
    } catch (err) {
      console.log('ERROR:', err.message)
      singleResults.push({ question: label, error: err.message })
    }
  }

  // Multi-turn conversations
  const conversationResults = []
  for (let i = 0; i < TEST_CONVERSATIONS.length; i++) {
    const conv = TEST_CONVERSATIONS[i]
    console.log(`\n\n=== CONVERSATION [${i + 1}/${TEST_CONVERSATIONS.length}] ${conv.label} ===`)
    const turns = []
    let conversationHistory = []
    for (let t = 0; t < conv.messages.length; t++) {
      const userMsg = conv.messages[t]
      console.log(`\n  User: ${userMsg}`)
      try {
        const response = await sendChatMessage(widgetData, userMsg, conversationHistory)
        console.log(`  Bot:  ${response?.slice(0, 200)}${response?.length > 200 ? '...' : ''}`)
        turns.push({ user: userMsg, response })
        conversationHistory.push({ isUser: true, text: userMsg })
        conversationHistory.push({ isUser: false, text: response })
      } catch (err) {
        console.log(`  ERROR: ${err.message}`)
        turns.push({ user: userMsg, error: err.message })
        break
      }
    }
    conversationResults.push({ label: conv.label, turns })
  }

  const output = {
    single: singleResults,
    conversations: conversationResults
  }

  const fs = require('fs')
  const outPath = 'scripts/test-results.json'
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\n\nFull results saved to ${outPath}`)
  console.log('\n=== SINGLE QUESTIONS SUMMARY (first 300 chars) ===')
  singleResults.forEach((r, i) => {
    const text = (r.response || r.error || '').replace(/\n/g, ' ')
    console.log(`\n[${i + 1}] ${r.question}`)
    console.log(text.slice(0, 300) + (text.length > 300 ? '...' : ''))
  })
  console.log('\n=== CONVERSATIONS SUMMARY ===')
  conversationResults.forEach((c, i) => {
    console.log(`\n[${i + 1}] ${c.label}`)
    c.turns.forEach((t, j) => {
      const text = (t.response || t.error || '').replace(/\n/g, ' ')
      console.log(`  Turn ${j + 1} User: ${t.user}`)
      console.log(`  Turn ${j + 1} Bot:  ${text.slice(0, 150)}${text.length > 150 ? '...' : ''}`)
    })
  })
  return output
}

run().catch(console.error)
