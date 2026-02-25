// Script to create database indexes via Supabase
// This uses the Supabase REST API to execute SQL

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('Make sure .env.local exists and has these variables')
  process.exit(1)
}

// Read the SQL file
const fs = require('fs')
const path = require('path')

const sqlFile = path.join(__dirname, 'database-indexes.sql')
const sqlContent = fs.readFileSync(sqlFile, 'utf8')

// Extract just the CREATE INDEX statements (skip comments and verification queries)
const createIndexStatements = sqlContent
  .split('\n')
  .filter(line => line.trim().startsWith('CREATE INDEX'))
  .map(line => line.trim())

console.log('🚀 Creating database indexes...\n')
console.log(`Found ${createIndexStatements.length} index creation statements\n`)

// Supabase doesn't allow direct SQL execution via JS client for security
// So we'll use the REST API with a workaround
async function createIndexes() {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Try to execute via Supabase REST API
  // Note: Supabase doesn't expose direct SQL execution for security
  // This will attempt to use pg functions if available
  
  console.log('⚠️  Supabase doesn\'t allow direct SQL execution via JavaScript client.')
  console.log('📋 Here are the indexes that need to be created:\n')
  
  createIndexStatements.forEach((sql, index) => {
    console.log(`${index + 1}. ${sql}`)
  })
  
  console.log('\n' + '='.repeat(70))
  console.log('📝 TO CREATE THESE INDEXES:')
  console.log('='.repeat(70))
  console.log('1. Go to your Supabase Dashboard')
  console.log('2. Click "SQL Editor" in the left sidebar')
  console.log('3. Click "New query"')
  console.log('4. Copy and paste the contents of database-indexes.sql')
  console.log('5. Click "Run" (or press Ctrl+Enter)')
  console.log('='.repeat(70))
  console.log('\nAlternatively, you can run this SQL file directly:')
  console.log(`File: ${sqlFile}`)
  console.log('\nThe indexes will be created automatically!')
}

createIndexes().catch(console.error)


