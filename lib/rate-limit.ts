// Rate limiting for Vercel serverless functions
// Uses Upstash Redis (free tier, serverless-friendly)

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client (uses environment variables)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limiters for different endpoints
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
  prefix: '@ratelimit/chat',
})

export const widgetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: '@ratelimit/widget',
})

export const scrapeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
  analytics: true,
  prefix: '@ratelimit/scrape',
})

// Helper to get client identifier (IP address)
export function getClientId(request: Request | { headers: { get: (key: string) => string | null } }): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  return ip
}

// Helper to check rate limit and return response if exceeded
export async function checkRateLimit(
  rateLimiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> {
  try {
    const result = await rateLimiter.limit(identifier)
    return result
  } catch (error) {
    // If Redis is not configured, allow the request (fail open)
    console.error('Rate limit error:', error)
    return null
  }
}

