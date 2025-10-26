// Simple test script for Apify integration
// Run with: node test-apify.js

const testUrl = 'https://thepioneerbar.com'

async function testApifyScraping() {
  try {
    console.log('Testing Apify scraping for:', testUrl)
    
    const response = await fetch('http://localhost:3000/api/scrape-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Scraping successful!')
      console.log('Method used:', result.method)
      console.log('Restaurant:', result.data.restaurantName)
      console.log('Menu items found:', result.data.menuItems.length)
      console.log('Phone:', result.data.phone)
      console.log('Address:', result.data.address)
      console.log('Hours:', result.data.hours)
      
      if (result.data.menuItems.length > 0) {
        console.log('\n📋 Sample menu items:')
        result.data.menuItems.slice(0, 5).forEach((item, index) => {
          console.log(`${index + 1}. ${item.name} - $${item.price}`)
        })
      }
    } else {
      console.log('❌ Scraping failed:', result.error)
      
      if (result.requiresManualInput) {
        console.log('\n📝 Manual input required:')
        console.log('Message:', result.message)
        if (result.suggestions) {
          console.log('\n💡 Suggestions:')
          result.suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testApifyScraping()
