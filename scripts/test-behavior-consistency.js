/**
 * Behavior consistency tests: run key questions and assert response shape
 * so that the same type of question always gets the same type of answer.
 *
 * Run with dev server: npm run dev
 * Then: node scripts/test-behavior-consistency.js
 *
 * Exits 0 if all pass, 1 if any fail. Report: scripts/behavior-consistency-report.json
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let WIDGET_ID = process.env.WIDGET_ID
const fs = require('fs')

const GENERIC_GREETING_PHRASE = 'How can I help with our menu, hours, location'
const OFF_TOPIC_REDIRECT_PHRASE = "I'm here to help with questions about our restaurant"

// Rules: each runs one question (or first of group) and asserts on response
const BEHAVIOR_RULES = [
  {
    id: 'general-hours-full-week',
    description: 'General hours questions get FULL weekly schedule, not one day',
    questions: ['What are your hours?', 'whats ur hours', 'what time do u close tonight'],
    assert: (response) => {
      const r = response.toLowerCase()
      const hasFullWeek = /sun–sat|sun-sat|sun.*sat|daily:\s*\d|dine-in and carryout share the same hours/i.test(response) ||
        (r.includes('sun') && (r.includes('sat') || r.includes('mon')))
      const singleDayOnly = /•\s*(mon|tue|wed|thu|fri|sat|sun):\s*\d/i.test(response) &&
        !/sun–sat|sun-sat|daily|dine-in and carryout share the same hours/i.test(response) &&
        (response.match(/•\s*(mon|tue|wed|thu|fri|sat|sun):/gi) || []).length < 2
      if (!hasFullWeek || singleDayOnly) return { pass: false, reason: 'Response must show full week (e.g. Sun–Sat), not only one day' }
      if (!r.includes('am') && !r.includes('pm')) return { pass: false, reason: 'Response has no time (AM/PM)' }
      return { pass: true }
    },
  },
  {
    id: 'open-right-now-no-greeting',
    description: '"Open rn" / "open??" get today\'s hours, NOT generic greeting',
    questions: ['r u open rn', 'open??'],
    assert: (response) => {
      if (response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is generic greeting instead of hours' }
      if (!/hours today|today \(.*\) are|am|pm/i.test(response)) return { pass: false, reason: 'Response has no today hours or time' }
      return { pass: true }
    },
  },
  {
    id: 'whats-filling-list',
    description: '"whats filling" gets list of options, NOT greeting',
    questions: ['whats filling'],
    assert: (response) => {
      if (response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is generic greeting' }
      if (!/•|here are|options/i.test(response)) return { pass: false, reason: 'Response has no list or options' }
      return { pass: true }
    },
  },
  {
    id: 'what-good-list',
    description: '"what good" gets recommendations, NOT greeting',
    questions: ['what good'],
    assert: (response) => {
      if (response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is generic greeting' }
      if (!/•|here are|options|entree|recommend/i.test(response)) return { pass: false, reason: 'Response has no list or recommendations' }
      return { pass: true }
    },
  },
  {
    id: 'good-stuff-list',
    description: '"good stuff?" gets list, NOT greeting',
    questions: ['good stuff?'],
    assert: (response) => {
      if (response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is generic greeting' }
      if (!/•|here are|options/i.test(response)) return { pass: false, reason: 'Response has no list' }
      return { pass: true }
    },
  },
  {
    id: 'healthy-list',
    description: '"healthy?" gets healthy options list, NOT greeting',
    questions: ['healthy?'],
    assert: (response) => {
      if (response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is generic greeting' }
      if (!/•|here are|options|salad|healthy/i.test(response)) return { pass: false, reason: 'Response has no healthy options list' }
      return { pass: true }
    },
  },
  {
    id: 'busy-tonight-not-redirect',
    description: '"busy tonight?" gets capacity/reservation answer, NOT off-topic redirect',
    questions: ['busy tonight?'],
    assert: (response) => {
      if (response.includes(OFF_TOPIC_REDIRECT_PHRASE)) return { pass: false, reason: 'Response is off-topic redirect' }
      if (!/call|reservation|book|busy|capacity|phone/i.test(response)) return { pass: false, reason: 'Response should mention calling or booking' }
      return { pass: true }
    },
  },
  {
    id: 'mild-options-not-redirect',
    description: '"what if i dont like spicy" gets mild options, NOT off-topic redirect',
    questions: ['what if i dont like spicy food'],
    assert: (response) => {
      if (response.includes(OFF_TOPIC_REDIRECT_PHRASE)) return { pass: false, reason: 'Response is off-topic redirect' }
      if (!/•|here are|mild|options|entree|not spicy|without spice/i.test(response)) return { pass: false, reason: 'Response should list mild/non-spicy options' }
      return { pass: true }
    },
  },
  {
    id: 'kids-eat-not-greeting',
    description: '"what do kids usually eat" gets kid-friendly answer, NOT only greeting',
    questions: ['what do kids usually eat'],
    assert: (response) => {
      if (response.trim().length < 80 && response.includes(GENERIC_GREETING_PHRASE)) return { pass: false, reason: 'Response is only generic greeting' }
      if (!/kid|child|menu|chicken|option|don\'t have|don\'t have a kids/i.test(response.toLowerCase())) return { pass: false, reason: 'Response should mention kids or menu options' }
      return { pass: true }
    },
  },
]

async function fetchWidgetData() {
  const res = await fetch(`${BASE_URL}/api/widget/${WIDGET_ID}?test=true`)
  if (!res.ok) throw new Error(`Widget fetch failed: ${res.status}`)
  return res.json()
}

async function sendChatMessage(widgetData, message) {
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
      session_id: `test-consistency-${Date.now()}`,
      restaurantContext,
      menuData: menuItems,
      conversationHistory: [],
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
    WIDGET_ID = await getLatestWidgetId()
    console.log('Widget ID:', WIDGET_ID)
  }
  const widgetData = await fetchWidgetData()
  const r = widgetData.restaurant || widgetData
  console.log('Restaurant:', r.name)
  console.log('Running', BEHAVIOR_RULES.length, 'behavior consistency checks...\n')

  const results = []
  let failed = 0

  for (const rule of BEHAVIOR_RULES) {
    const question = rule.questions[0]
    let response
    try {
      response = await sendChatMessage(widgetData, question)
    } catch (err) {
      results.push({
        id: rule.id,
        description: rule.description,
        question,
        pass: false,
        reason: err.message,
        response: null,
      })
      failed++
      console.log('FAIL', rule.id, question.slice(0, 40), '—', err.message)
      continue
    }
    const outcome = rule.assert(response)
    const pass = outcome.pass === true
    if (!pass) failed++
    results.push({
      id: rule.id,
      description: rule.description,
      question,
      pass,
      reason: outcome.reason || null,
      responseSnippet: response.slice(0, 300),
    })
    console.log(pass ? 'PASS' : 'FAIL', rule.id, question.slice(0, 40), pass ? '' : '—', outcome.reason || '')
  }

  const report = {
    runAt: new Date().toISOString(),
    restaurant: r.name,
    total: BEHAVIOR_RULES.length,
    passed: BEHAVIOR_RULES.length - failed,
    failed,
    results,
  }

  const outPath = 'scripts/behavior-consistency-report.json'
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log('\n' + (failed ? `Failed: ${failed}/${BEHAVIOR_RULES.length}` : `All ${BEHAVIOR_RULES.length} checks passed.`))
  console.log('Report:', outPath)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
