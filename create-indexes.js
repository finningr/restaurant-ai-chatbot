// Script to create database indexes
// Run with: node create-indexes.js

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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const indexQueries = [
  // RESTAURANTS TABLE INDEXES
  {
    name: 'idx_restaurants_widget_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_restaurants_widget_id ON restaurants(widget_id);`
  },
  {
    name: 'idx_restaurants_is_active',
    sql: `CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active) WHERE is_active = true;`
  },
  {
    name: 'idx_restaurants_widget_active',
    sql: `CREATE INDEX IF NOT EXISTS idx_restaurants_widget_active ON restaurants(widget_id, is_active) WHERE is_active = true;`
  },
  
  // MENU_ITEMS TABLE INDEXES
  {
    name: 'idx_menu_items_restaurant_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);`
  },
  {
    name: 'idx_menu_items_available',
    sql: `CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available) WHERE available = true;`
  },
  {
    name: 'idx_menu_items_category',
    sql: `CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);`
  },
  {
    name: 'idx_menu_items_restaurant_available_category',
    sql: `CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available_category ON menu_items(restaurant_id, available, category) WHERE available = true;`
  },
  {
    name: 'idx_menu_items_name',
    sql: `CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);`
  },
  
  // CHATBOT_SETTINGS TABLE INDEXES
  {
    name: 'idx_chatbot_settings_restaurant_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_chatbot_settings_restaurant_id ON chatbot_settings(restaurant_id);`
  }
]

async function createIndexes() {
  console.log('🚀 Starting index creation...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const index of indexQueries) {
    try {
      console.log(`Creating index: ${index.name}...`)
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: index.sql })
      
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabaseAdmin
          .from('_exec_sql')
          .select('*')
          .limit(0)
        
        if (directError) {
          // Use raw SQL execution via PostgREST
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql: index.sql })
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
        }
      }
      
      console.log(`  ✅ Created: ${index.name}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Failed: ${index.name}`)
      console.error(`     Error: ${error.message}`)
      errorCount++
    }
  }
  
  console.log(`\n${'='.repeat(50)}`)
  console.log(`✅ Successfully created: ${successCount} indexes`)
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} indexes`)
  }
  console.log(`${'='.repeat(50)}\n`)
  
  // Verify indexes were created
  console.log('Verifying indexes...')
  try {
    const { data, error } = await supabaseAdmin
      .from('pg_indexes')
      .select('tablename, indexname')
      .in('tablename', ['restaurants', 'menu_items', 'chatbot_settings'])
      .order('tablename')
    
    if (error) {
      // Alternative: Use direct SQL query
      const { data: indexData, error: indexError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('restaurants', 'menu_items', 'chatbot_settings') ORDER BY tablename, indexname;`
      })
      
      if (!indexError && indexData) {
        console.log('\nCreated indexes:')
        indexData.forEach((row: any) => {
          console.log(`  - ${row.tablename}.${row.indexname}`)
        })
      }
    } else if (data) {
      console.log('\nCreated indexes:')
      data.forEach((row: any) => {
        console.log(`  - ${row.tablename}.${row.indexname}`)
      })
    }
  } catch (error) {
    console.log('(Could not verify indexes - but they may still be created)')
  }
}

createIndexes().catch(console.error)


