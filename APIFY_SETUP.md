# Apify Integration Setup Guide

## Overview
This guide will help you set up Apify for enhanced restaurant website scraping in your restaurant AI chatbot project.

## Prerequisites
- Node.js and npm installed
- Apify account (free tier available)

## Step 1: Create Apify Account
1. Go to [https://apify.com](https://apify.com)
2. Sign up for a free account
3. Navigate to your account settings
4. Generate an API token

## Step 2: Configure Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Apify Configuration
APIFY_TOKEN=your_apify_token_here

# OpenAI Configuration (if not already set)
OPENAI_API_KEY=your_openai_api_key_here
```

## Step 3: Install Dependencies
The Apify client has already been installed. If you need to reinstall:

```bash
npm install apify-client
```

## Step 4: Test the Integration

### Option A: Test with The Pioneer Bar
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the scraping endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/scrape-website \
     -H "Content-Type: application/json" \
     -d '{"url": "https://thepioneerbar.com"}'
   ```

### Option B: Test with Apify Directly
You can also test the dedicated Apify endpoint:
```bash
curl -X POST http://localhost:3000/api/apify-scraper \
  -H "Content-Type: application/json" \
  -d '{"url": "https://thepioneerbar.com"}'
```

## How It Works

### Apify-Only Approach
The scraping system now uses only Apify:

1. **Primary**: Uses Apify for all scraping with JavaScript handling and comprehensive crawling
2. **Manual Input**: If Apify fails, the system returns an error asking for manual input instead of falling back to other methods

### Apify Benefits
- **JavaScript Rendering**: Handles dynamic content that loads via JavaScript
- **Better Page Discovery**: Crawls up to 50 pages with intelligent link following
- **Enhanced Menu Extraction**: Uses advanced selectors for modern restaurant websites
- **Anti-Detection**: Built-in mechanisms to avoid being blocked
- **Reliability**: Professional infrastructure with better success rates

### Expected Results for The Pioneer Bar
With Apify, you should get:
- ✅ Main page content
- ✅ Food menu page (`/denver-the-pioneer-bar-food-menu`)
- ✅ Drink menu page (`/denver-the-pioneer-bar-drink-menu`)
- ✅ Specials page (`/denver-the-pioneer-bar-happy-hours-specials`)
- ✅ Events page (`/denver-the-pioneer-bar-events`)
- ✅ Contact information
- ✅ Business hours
- ✅ Menu items with prices and descriptions

### Error Handling
If Apify fails, the system will return:
- Clear error message explaining the failure
- `requiresManualInput: true` flag
- Helpful suggestions for the user
- No fallback to other scraping methods

## Pricing
- **Free Tier**: 10,000 compute units per month
- **Starter Plan**: $49/month for 100,000 compute units
- **Scale Plan**: $199/month for 500,000 compute units

For restaurant scraping, the free tier should be sufficient for testing and small-scale usage.

## Troubleshooting

### Common Issues
1. **"Apify token not configured"**: Make sure your `.env.local` file has the correct `APIFY_TOKEN`
2. **"Apify scraping failed"**: Check your internet connection and Apify account status
3. **Rate limiting**: If you hit rate limits, consider upgrading your Apify plan

### Debug Mode
To see detailed logs, check your console output when running the scraping endpoint.

## Next Steps
1. Test with The Pioneer Bar URL
2. Verify that all associated pages are being crawled
3. Check that menu items are being extracted correctly
4. Monitor your Apify usage in the dashboard

## Support
- Apify Documentation: [https://docs.apify.com](https://docs.apify.com)
- Apify Support: Available through their platform
- Project Issues: Check the GitHub repository for this project
