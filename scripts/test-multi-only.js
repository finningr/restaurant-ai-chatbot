/**
 * Multi-turn conversation test only — hundreds of conversations, thousands of messages.
 * Run with dev server: npm run dev
 * Then: node scripts/test-multi-only.js
 * Or: WIDGET_ID=restaurant-xxx node scripts/test-multi-only.js
 *
 * Count only: node scripts/test-multi-only.js --count-only
 * Output: scripts/test-multi-only-results.json
 * (~1000+ conversations, ~2800+ messages; full run can take 1–2 hours)
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let WIDGET_ID = process.env.WIDGET_ID

const fs = require('fs')

// --- Build hundreds of multi-turn conversations from building blocks ---
const OPENERS = [
  'hi',
  'hello',
  'What are your hours?',
  'Where are you located?',
  'What\'s your phone number?',
  'What\'s your address?',
  'Tell me about your menu',
  'What type of food do you serve?',
  'What do you have?',
  'What do you recommend?',
  'What\'s popular?',
  'Best thing on the menu?',
  'Do you have vegan options?',
  'Do you have vegetarian options?',
  'I have a nut allergy, what can I eat?',
  'Gluten free options?',
  'Tell me about dietary accommodations',
  'Do you deliver?',
  'Can I order online?',
  'Do you take reservations?',
  'Can I make a reservation?',
  'What appetizers do you have?',
  'What entrees do you have?',
  'What desserts do you have?',
  'What do you have for drinks?',
  'drinks',
  'Something under $10',
  'recommend something cheap',
  'budget-friendly options',
  'Do you have outdoor seating?',
  'Do you have a kids menu?',
  'What sandwiches do you have?',
  'Tell me about the lamb shanks',
  'Tell me about the hummus',
  'falafel',
  'What soups do you have?',
  'What salads do you have?',
]

const FOLLOW_UPS_GENERIC = [
  'How much is it?',
  'How much is the first one?',
  'Tell me more',
  'Tell me more about that',
  'Which one do you recommend?',
  'What goes well with that?',
  'Are you open tonight?',
  'What\'s the price?',
  'What\'s the price of the first one?',
  'thanks',
  'Is it gluten free?',
  'Is that vegan?',
  'What\'s in it?',
  'Do you have a link?',
  'What\'s the link?',
  'How do I get there from downtown?',
  'Would you recommend that one?',
  'Any under $20?',
  'Which of those are vegan?',
  'which ones have caffeine?',
  'Any without caffeine?',
  'Is the hummus safe?',
  'What else do you recommend?',
  'Anything else?',
  'Do you have a link to book online?',
  'What\'s your phone number?',
  'Where are you located?',
  'What are your hours?',
]

const FOLLOW_UPS_AFTER_MENU = [
  'What about the falafel?',
  'What about the hummus?',
  'What entrees do you have?',
  'What appetizers do you have?',
  'What desserts do you have?',
  'How much is the guacamole?',
  'What do you recommend?',
]

const TURN_3 = [
  'How much is it?',
  'Tell me more about that',
  'Is it gluten free?',
  'What goes well with that?',
  'What\'s the price?',
  'thanks',
  'Is that vegan?',
]

const TURN_4 = [
  'How much is it?',
  'thanks',
  'What\'s your address?',
  'What\'s your phone number?',
]

function buildConversations() {
  const out = []
  let id = 0

  // 2-turn: each opener with up to 10 follow-ups → ~380 2-turn convos
  const followPool = FOLLOW_UPS_GENERIC.concat(FOLLOW_UPS_AFTER_MENU)
  const followUpsPerOpener = 10
  OPENERS.forEach((opener) => {
    for (let j = 0; j < Math.min(followUpsPerOpener, followPool.length); j++) {
      const follow = followPool[(j * 3 + opener.length) % followPool.length] // variety per opener
      out.push({
        id: ++id,
        label: `2-turn #${id}: ${opener.slice(0, 28)} → ${follow.slice(0, 22)}`,
        messages: [opener, follow],
      })
    }
  })

  // 3-turn: ~320 conversations (10 openers × 8 follow × 4 turn3)
  const openers3 = [
    'Tell me about your menu', 'What do you recommend?', 'What do you have?', 'Do you have vegan options?',
    'I have a nut allergy', 'What appetizers do you have?', 'drinks', 'What are your hours?', 'Do you deliver?',
    'Something under $10',
  ]
  const follow3 = [
    'What about the falafel?', 'How much is the first one?', 'Which one do you recommend?', 'which ones have caffeine?',
    'Any under $20?', 'nuts', 'What goes well with that?', 'Are you open tonight?',
  ]
  openers3.forEach((opener) => {
    follow3.forEach((f2) => {
      TURN_3.forEach((f3) => {
        out.push({
          id: ++id,
          label: `3-turn #${id}: ${opener.slice(0, 18)} → … → ${f3.slice(0, 18)}`,
          messages: [opener, f2, f3],
        })
      })
    })
  })

  // 4-turn: ~96 (4×4×3×2)
  const openers4 = ['Tell me about your menu', 'What do you recommend?', 'Do you have vegan options?', 'What do you have?']
  const f2_4 = ['What entrees do you have?', 'What about the falafel?', 'How much is the first one?', 'Which one do you recommend?']
  const f3_4 = ['How much is it?', 'Tell me more about that', 'What goes well with that?']
  openers4.forEach((opener) => {
    f2_4.forEach((f2) => {
      f3_4.forEach((f3) => {
        TURN_4.slice(0, 2).forEach((f4) => {
          out.push({
            id: ++id,
            label: `4-turn #${id}`,
            messages: [opener, f2, f3, f4],
          })
        })
      })
    })
  })

  // 5-turn: 5 long chains
  const fiveTurnMessages = [
    ['Tell me about your menu', 'What entrees do you have?', 'Which one do you recommend?', 'How much is it?', 'thanks'],
    ['What do you recommend?', 'What goes well with that?', 'How much is that?', 'Is it gluten free?', 'thanks'],
    ['Do you have vegan options?', 'Tell me more about the first one', 'What\'s the price?', 'What goes well with that?', 'thanks'],
    ['What are your hours?', 'Where are you located?', 'What\'s your phone number?', 'Do you take reservations?', 'thanks'],
    ['drinks', 'which ones have caffeine?', 'How much is the coffee?', 'What about iced tea?', 'thanks'],
  ]
  fiveTurnMessages.forEach((msgs) => {
    out.push({
      id: ++id,
      label: `5-turn #${id}: ${msgs[0].slice(0, 24)} → … → thanks`,
      messages: msgs,
    })
  })

  return out
}

let TEST_CONVERSATIONS = buildConversations()
const MAX_CONVOS = process.env.MAX_CONVOS ? parseInt(process.env.MAX_CONVOS, 10) : null
if (MAX_CONVOS != null && MAX_CONVOS > 0) {
  TEST_CONVERSATIONS = TEST_CONVERSATIONS.slice(0, MAX_CONVOS)
}
const TOTAL_MESSAGES = TEST_CONVERSATIONS.reduce((s, c) => s + c.messages.length, 0)
if (process.argv.includes('--count-only')) {
  console.log('Conversations:', TEST_CONVERSATIONS.length, '| Total messages:', TOTAL_MESSAGES)
  process.exit(0)
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
      session_id: `test-multi-${Date.now()}`,
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

  const totalMessages = TEST_CONVERSATIONS.reduce((sum, c) => sum + c.messages.length, 0)
  console.log(`\nMulti-turn only: ${TEST_CONVERSATIONS.length} conversations, ${totalMessages} total messages.\n`)

  const conversationResults = []
  const LOG_EVERY = Math.max(1, Math.floor(TEST_CONVERSATIONS.length / 20))

  for (let i = 0; i < TEST_CONVERSATIONS.length; i++) {
    const conv = TEST_CONVERSATIONS[i]
    if (i > 0 && i % LOG_EVERY === 0) {
      console.log(`[${i}/${TEST_CONVERSATIONS.length}] ${conv.label}`)
    }
    const turns = []
    let conversationHistory = []
    let failed = false
    for (let t = 0; t < conv.messages.length; t++) {
      const userMsg = conv.messages[t]
      try {
        const response = await sendChatMessage(widgetData, userMsg, conversationHistory)
        turns.push({ user: userMsg, response })
        conversationHistory.push({ isUser: true, text: userMsg })
        conversationHistory.push({ isUser: false, text: response })
      } catch (err) {
        turns.push({ user: userMsg, error: err.message })
        failed = true
        break
      }
    }
    conversationResults.push({ id: conv.id, label: conv.label, turns, failed })
  }

  const totalTurns = conversationResults.reduce((s, c) => s + c.turns.length, 0)
  const failures = conversationResults.filter(c => c.failed).length

  const output = {
    meta: {
      restaurant: r.name,
      widget_id: WIDGET_ID,
      totalConversations: TEST_CONVERSATIONS.length,
      totalMessages: totalTurns,
      failedConversations: failures,
      runAt: new Date().toISOString(),
    },
    conversations: conversationResults,
  }

  const outPath = 'scripts/test-multi-only-results.json'
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\nDone. ${totalTurns} messages in ${TEST_CONVERSATIONS.length} conversations. Failures: ${failures}`)
  console.log(`Results saved to ${outPath}`)
  return output
}

run().catch(console.error)
