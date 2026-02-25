# Production Deployment Guide

Complete checklist and guide for deploying the Restaurant AI Chatbot to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env.production` file (or set in your hosting platform) with all required variables:

```bash
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-...

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# Optional: If you need admin access from server
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NextAuth Configuration (REQUIRED if using auth)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars

# Apify Configuration (OPTIONAL - for website scraping)
APIFY_TOKEN=apify_api_...

# Node Environment
NODE_ENV=production
```

**✅ Verification Steps:**
- [ ] All required variables are set
- [ ] `OPENAI_API_KEY` has sufficient credits/quota
- [ ] `NEXTAUTH_SECRET` is a strong random string (32+ characters)
- [ ] Supabase URL and keys are correct
- [ ] Test API endpoints with production keys

---

### 2. Database Setup

#### 2.1 Run Schema Migration

Execute your latest schema file in Supabase SQL Editor:

```sql
-- Use: supabase-schema-final.sql or supabase-schema-simple.sql
```

**✅ Verification Steps:**
- [ ] All tables created (`restaurants`, `menu_items`, `chatbot_settings`)
- [ ] Foreign key constraints are in place
- [ ] Indexes are created (see Index Optimization section below)

#### 2.2 Row Level Security (RLS) Policies

**CRITICAL:** Enable RLS and create appropriate policies:

```sql
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Example: Allow public read access to restaurants (for widget)
CREATE POLICY "Public read restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

-- Example: Allow public read access to menu items
CREATE POLICY "Public read menu_items" ON menu_items
  FOR SELECT USING (available = true);

-- Example: Restrict chatbot_settings to authenticated users only
CREATE POLICY "Authenticated users only" ON chatbot_settings
  FOR ALL USING (auth.role() = 'authenticated');
```

**✅ Verification Steps:**
- [ ] RLS is enabled on all tables
- [ ] Public endpoints can read restaurant/menu data
- [ ] Admin endpoints require authentication
- [ ] Test widget access without authentication

#### 2.3 Database Indexes

Create indexes for performance:

```sql
-- Index on widget_id (most common lookup)
CREATE INDEX idx_restaurants_widget_id ON restaurants(widget_id);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);

-- Index on restaurant_id (for menu items)
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_available ON menu_items(available);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Index on chatbot_settings
CREATE INDEX idx_chatbot_settings_restaurant_id ON chatbot_settings(restaurant_id);
```

**✅ Verification Steps:**
- [ ] Indexes are created
- [ ] Query performance is acceptable (< 100ms for widget data)
- [ ] Monitor slow queries in Supabase dashboard

---

### 3. Security Hardening

#### 3.1 API Route Security

**✅ Checklist:**
- [ ] Rate limiting implemented on `/api/chat` (see below)
- [ ] Input validation on all API routes
- [ ] CORS headers configured correctly
- [ ] No sensitive data in error messages
- [ ] API keys are server-side only (never exposed to client)

#### 3.2 Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Example: Add to app/api/chat/route.ts
// Use a library like 'rate-limiter-flexible' or implement Redis-based limiting
```

**Recommended Limits:**
- Chat API: 20 requests per minute per IP
- Widget API: 100 requests per minute per IP
- Scraping API: 5 requests per hour per IP

#### 3.3 Environment Variable Security

**✅ Checklist:**
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git
- [ ] Production secrets are different from development
- [ ] Secrets are rotated periodically

---

### 4. Performance Optimization

#### 4.1 Next.js Configuration

Check `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  reactStrictMode: true,
  
  // Optimize images if using Next.js Image component
  images: {
    domains: ['your-image-domain.com'],
  },
  
  // Enable compression
  compress: true,
  
  // Production source maps (optional, for debugging)
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
```

#### 4.2 Caching Strategy

**✅ Implement Caching:**
- [ ] Menu data cached (5-10 minutes)
- [ ] Restaurant data cached (15-30 minutes)
- [ ] Use Next.js API route caching or Redis
- [ ] Cache invalidation on data updates

**Example Implementation:**
```typescript
// In app/api/widget/[widgetId]/route.ts
export const revalidate = 300 // Cache for 5 minutes
```

#### 4.3 OpenAI API Optimization

**✅ Checklist:**
- [ ] `temperature` set to 0.3 (already done)
- [ ] `max_tokens` set appropriately (already done)
- [ ] Retry logic implemented (already done)
- [ ] Fallback model configured (already done)
- [ ] Monitor API usage and costs

---

### 5. Monitoring & Error Handling

#### 5.1 Error Monitoring

**Recommended Services:**
- **Sentry** (recommended): Free tier available
- **LogRocket**: Session replay + error tracking
- **Vercel Analytics**: Built-in if using Vercel

**Setup Steps:**
1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Initialize in `sentry.client.config.js` and `sentry.server.config.js`

3. Wrap API routes with error tracking

**✅ Checklist:**
- [ ] Error monitoring service configured
- [ ] Alerts set up for critical errors
- [ ] Error boundaries in React components
- [ ] API errors are logged and tracked

#### 5.2 Analytics

**✅ Checklist:**
- [ ] Chatbot usage analytics implemented (`/api/analytics`)
- [ ] Track: messages sent, errors, popular questions
- [ ] Dashboard to view analytics
- [ ] Privacy-compliant (no PII)

#### 5.3 Logging

**✅ Checklist:**
- [ ] Structured logging implemented
- [ ] Log levels configured (error, warn, info)
- [ ] Sensitive data excluded from logs
- [ ] Log aggregation service configured (if needed)

---

### 6. Testing Before Deployment

#### 6.1 Functional Testing

**✅ Test Checklist:**
- [ ] Chatbot responds correctly to all question types
- [ ] Duplicate prevention works
- [ ] Formatting is correct (bullets, spacing, questions)
- [ ] Widget loads and functions correctly
- [ ] Menu data displays correctly
- [ ] Hours and contact info display correctly
- [ ] Dietary accommodations work
- [ ] "All items shown" message appears correctly

#### 6.2 Performance Testing

**✅ Test Checklist:**
- [ ] API response times < 2 seconds
- [ ] Widget loads < 1 second
- [ ] Handles concurrent users (test with 10+ simultaneous requests)
- [ ] Database queries are optimized
- [ ] No memory leaks in long conversations

#### 6.3 Security Testing

**✅ Test Checklist:**
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] Rate limiting works
- [ ] Unauthorized access is blocked
- [ ] Sensitive data not exposed in responses

---

### 7. Deployment Steps

#### 7.1 Build & Test Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start

# Test on http://localhost:3000
```

**✅ Verification:**
- [ ] Build completes without errors
- [ ] Production build runs locally
- [ ] All pages load correctly
- [ ] API routes work

#### 7.2 Deploy to Hosting Platform

**Vercel (Recommended for Next.js):**

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Deploy

**Other Platforms (Netlify, Railway, etc.):**
- Follow platform-specific Next.js deployment guides
- Ensure Node.js version matches (check `package.json` engines)

**✅ Post-Deployment Verification:**
- [ ] Site loads correctly
- [ ] API routes respond
- [ ] Widget embeds work
- [ ] Database connections work
- [ ] Environment variables are set correctly

---

### 8. Post-Deployment Monitoring

#### 8.1 First 24 Hours

**✅ Monitor:**
- [ ] Error rates (should be < 1%)
- [ ] API response times
- [ ] OpenAI API usage and costs
- [ ] Database query performance
- [ ] User feedback/errors

#### 8.2 Ongoing Monitoring

**✅ Weekly Checks:**
- [ ] Review error logs
- [ ] Check OpenAI API costs
- [ ] Monitor database performance
- [ ] Review analytics data
- [ ] Check for security updates

---

### 9. Backup & Recovery

#### 9.1 Database Backups

**Supabase Automatic Backups:**
- Supabase provides automatic daily backups
- Verify backup retention policy
- Test restore process

**✅ Checklist:**
- [ ] Backup schedule confirmed
- [ ] Backup retention period set
- [ ] Restore process tested
- [ ] Manual backup script created (optional)

#### 9.2 Code Backups

**✅ Checklist:**
- [ ] Code in version control (Git)
- [ ] Environment variables documented (securely)
- [ ] Deployment process documented

---

### 10. Scaling Considerations

#### 10.1 When to Scale

**Signs you need to scale:**
- API response times > 3 seconds
- Database connection pool exhausted
- High error rates during peak times
- OpenAI API rate limits hit frequently

#### 10.2 Scaling Options

**Horizontal Scaling:**
- Deploy multiple instances
- Use load balancer
- Ensure stateless API design (already done)

**Database Scaling:**
- Upgrade Supabase plan
- Add read replicas
- Optimize queries

**Caching:**
- Implement Redis for caching
- Cache menu/restaurant data
- Cache OpenAI responses (if appropriate)

---

## 🚨 Critical Issues to Address Before Production

1. **Rate Limiting**: Implement rate limiting on `/api/chat` to prevent abuse
2. **Error Monitoring**: Set up Sentry or similar service
3. **RLS Policies**: Ensure Row Level Security is properly configured
4. **Environment Variables**: All production secrets must be set
5. **Database Indexes**: Create indexes for performance
6. **OpenAI Quota**: Ensure sufficient credits and auto-recharge enabled

---

## 📝 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with production values

# 3. Run database migrations
# Execute supabase-schema-final.sql in Supabase SQL Editor

# 4. Create database indexes
# Execute index creation SQL (see section 2.3)

# 5. Set up RLS policies
# Execute RLS policy SQL (see section 2.2)

# 6. Build and test locally
npm run build
npm start

# 7. Deploy to hosting platform
# Follow platform-specific deployment guide
```

---

## 🔗 Useful Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-to-prod)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## ✅ Final Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Database schema migrated
- [ ] RLS policies configured
- [ ] Database indexes created
- [ ] Rate limiting implemented
- [ ] Error monitoring configured
- [ ] Analytics tracking working
- [ ] Security testing passed
- [ ] Performance testing passed
- [ ] Backup strategy in place
- [ ] Documentation complete
- [ ] Team trained on monitoring tools

---

**Ready to deploy?** Start with the Quick Start Commands above and work through each section systematically.


