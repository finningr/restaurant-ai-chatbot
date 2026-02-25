/**
 * Run the user's question set: single questions by category + multi-turn conversations.
 * Dev server: npm run dev. Then: node scripts/test-user-questions.js
 * Output: scripts/test-user-questions-results.json
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let WIDGET_ID = process.env.WIDGET_ID
const fs = require('fs')

const QUESTIONS_BY_CATEGORY = {
  basicInfo: [
    'what time do u close tonight',
    'r u open rn',
    'are you open on sundays?',
    'whats ur hours',
    'when do u stop serving food',
    'do you close early today?',
    'what time kitchen closes?',
    'are you guys open christmas eve',
    'open monday?',
    'when do u open tomorrow',
  ],
  location: [
    'where are you located',
    'whats the address',
    'directions?',
    'parking?',
    'is there parking near u',
    'are you downtown?',
    'how far from campus',
    'do u have parking lot',
    'street parking ok?',
    'near campus?',
  ],
  menu: [
    'can i see the menu',
    'whats good here',
    'what do ppl usually get',
    'best dishes?',
    'what should i order',
    'whats ur most popular thing',
    'is the pasta good?',
    'do u have burgers',
    'do you guys serve breakfast',
    'do u have drinks',
  ],
  recommendation: [
    'what should i get',
    'im hungry what should i eat',
    'recommend something',
    'idk what i want lol',
    'something not too heavy?',
    'something spicy',
    'whats filling',
    'good comfort food?',
    'what do u recommend for dinner',
    'whats best for first time here',
  ],
  allergy: [
    'anything gluten free?',
    'im gluten free what can i eat',
    'dairy free options?',
    'no peanuts right?',
    'i have nut allergy what safe',
    'vegan stuff?',
    'vegetarian?',
    'soy allergy options?',
    'shellfish allergy safe?',
    'im allergic to eggs can i eat here',
  ],
  dietaryAndRec: [
    'whats good thats vegan',
    'recommend gluten free dishes',
    'something dairy free and filling',
    'keto options?',
    'healthy options?',
    'low carb stuff?',
    'vegan and gluten free?',
    'high protein options?',
    'light meal ideas?',
    'not too oily options?',
  ],
  delivery: [
    'do you deliver',
    'can i order online',
    'door dash?',
    'uber eats?',
    'grubhub?',
    'how do i order',
    'can i pick up',
    'takeout available?',
    'order for pickup?',
    'where do i order delivery',
  ],
  reservations: [
    'do i need a reservation',
    'can i book a table',
    'reserve for 4',
    'table for 2 tonight?',
    'do u take reservations',
    'walk ins ok?',
    'busy tonight?',
    'can i reserve online',
    'book for tomorrow',
    'party of 6 ok?',
  ],
  mixedRealistic: [
    'are u open and do u have vegan food',
    'whats good and gluten free',
    'do u deliver and whats popular',
    'im near campus are u open rn',
    'what should i order for takeout',
    'do u have spicy stuff and is it really spicy',
    'parking and hours?',
    'do u guys have outdoor seating and are u open late',
    'is it expensive there',
    'best cheap options?',
    'what should 2 ppl order',
  ],
  messyHuman: [
    'u got vegan??',
    'open??',
    'menu?',
    'delivery??',
    'what good',
    'spicy food?',
    'gluten free??',
    'u open late?',
    'food recs pls',
    'good stuff?',
    'cheap food?',
    'healthy?',
    'big portions?',
    'dessert good?',
  ],
  edgeCase: [
    'what should i get if im picky',
    'what if i dont like spicy food',
    'whats your best dish but not too expensive',
    'what do kids usually eat',
    'what should my gf order shes vegetarian',
    'im really hungry what should i get',
    'whats the biggest portion',
    'is anything actually spicy or just mild',
    'whats worth the money',
    'what do regulars get',
  ],
}

const MULTI_TURN_CONVERSATIONS = [
  {
    label: 'Conversation 1: open → recommend → gluten free → delivery',
    messages: [
      'are u open rn',
      'what do u recommend',
      'anything gluten free',
      'ok what about delivery',
    ],
  },
  {
    label: 'Conversation 2: what should i get → not heavy → no dairy → takeout',
    messages: [
      'what should i get',
      'something not too heavy',
      'no dairy',
      'ok how about takeout',
    ],
  },
  {
    label: 'Conversation 3: deliver → doordash? → whats good there',
    messages: [
      'do u deliver',
      'thru doordash?',
      'whats good there',
    ],
  },
  {
    label: 'Conversation 4: nut allergy → what can i eat → recommend',
    messages: [
      'im allergic to nuts',
      'what can i eat',
      'what do u recommend',
    ],
  },
]

function flattenQuestions() {
  const out = []
  for (const [category, questions] of Object.entries(QUESTIONS_BY_CATEGORY)) {
    questions.forEach((q) => out.push({ category, question: q }))
  }
  return out
}

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
  if (Array.isArray(svc) && svc.length > 0) restaurantContext += `\nSpecial Services Offered: ${svc.join(', ')}`

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      widget_id: WIDGET_ID,
      session_id: `test-user-q-${Date.now()}`,
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
  if (!restaurants?.length) throw new Error('No restaurants found.')
  return restaurants[0].widget_id
}

async function run() {
  if (!WIDGET_ID) {
    console.log('Fetching latest restaurant...')
    WIDGET_ID = await getLatestWidgetId()
    console.log('Widget ID:', WIDGET_ID)
  }
  console.log('Fetching widget data...')
  const widgetData = await fetchWidgetData()
  const r = widgetData.restaurant || widgetData
  console.log('Restaurant:', r.name)

  const flat = flattenQuestions()
  const totalSingle = flat.length
  const totalConvMessages = MULTI_TURN_CONVERSATIONS.reduce((s, c) => s + c.messages.length, 0)
  console.log(`\nSingle questions: ${totalSingle} | Multi-turn: ${MULTI_TURN_CONVERSATIONS.length} convos (${totalConvMessages} messages)\n`)

  const resultsByCategory = {}
  for (const [category] of Object.entries(QUESTIONS_BY_CATEGORY)) {
    resultsByCategory[category] = []
  }

  let idx = 0
  for (const { category, question } of flat) {
    idx++
    if (idx % 20 === 0) console.log(`  Single [${idx}/${totalSingle}] ${category}: ${question.slice(0, 40)}...`)
    try {
      const response = await sendChatMessage(widgetData, question)
      resultsByCategory[category].push({ question, response })
    } catch (err) {
      resultsByCategory[category].push({ question, error: err.message })
    }
  }

  const conversationResults = []
  for (let i = 0; i < MULTI_TURN_CONVERSATIONS.length; i++) {
    const conv = MULTI_TURN_CONVERSATIONS[i]
    console.log(`  Multi-turn [${i + 1}/${MULTI_TURN_CONVERSATIONS.length}] ${conv.label}`)
    const turns = []
    let history = []
    for (const userMsg of conv.messages) {
      try {
        const response = await sendChatMessage(widgetData, userMsg, history)
        turns.push({ user: userMsg, response })
        history.push({ isUser: true, text: userMsg })
        history.push({ isUser: false, text: response })
      } catch (err) {
        turns.push({ user: userMsg, error: err.message })
        break
      }
    }
    conversationResults.push({ label: conv.label, turns })
  }

  const output = {
    meta: {
      restaurant: r.name,
      widget_id: WIDGET_ID,
      runAt: new Date().toISOString(),
      singleCount: totalSingle,
      conversationCount: MULTI_TURN_CONVERSATIONS.length,
      conversationMessageCount: totalConvMessages,
    },
    byCategory: resultsByCategory,
    conversations: conversationResults,
  }

  const outPath = 'scripts/test-user-questions-results.json'
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\nDone. Results saved to ${outPath}`)
  return output
}

run().catch(console.error)
