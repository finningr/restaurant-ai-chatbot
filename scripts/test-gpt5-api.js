/**
 * Quick test script for GPT-5 API - run with: node scripts/test-gpt5-api.js
 * Requires OPENAI_API_KEY in .env.local or environment
 */
require('dotenv').config({ path: '.env.local' })
const { OpenAI } = require('openai')

async function test() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in .env.local')
    process.exit(1)
  }

  const openai = new OpenAI({ apiKey })

  console.log('\n=== Test 1: Responses API + reasoning_effort: none ===')
  try {
    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one short sentence.' }
      ],
      max_output_tokens: 100,
      text: { format: { type: 'text' } },
      reasoning: { effort: 'minimal' }, // Minimal reasoning - hopefully more message output
    })
    console.log('output_text:', JSON.stringify((response).output_text))
    console.log('output items:', (response).output?.map(o => ({ type: o.type, keys: Object.keys(o || {}) })))
    console.log('FULL output[0]:', JSON.stringify((response).output?.[0], null, 2)?.slice(0, 800))
    console.log('SUCCESS:', !!((response).output_text || '').trim())
  } catch (err) {
    console.error('ERROR:', err.message)
    if (err.response) console.error('Response status:', err.response?.status)
    if (err.error) console.error('Error details:', JSON.stringify(err.error, null, 2))
  }

  console.log('\n=== Test 2: Chat Completions (for comparison) ===')
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one short sentence.' }
      ],
      max_completion_tokens: 100,
    })
    const content = completion.choices?.[0]?.message?.content
    console.log('content:', JSON.stringify(content))
    console.log('SUCCESS:', !!(content || '').trim())
  } catch (err) {
    console.error('ERROR:', err.message)
  }

  console.log('\nDone.')
}

test()
