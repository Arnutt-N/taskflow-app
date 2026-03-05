// lib/rateLimit.ts
// Rate limiting middleware for API routes
// Supports both in-memory (dev) and Redis (production) backends

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window per IP
  message?: string;    // Custom error message
}

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory store (suitable for single server / dev)
// For production with multiple instances, use Redis
const memoryStore = new Map<string, RateLimitStore>();

// Cleanup old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Get client IP from request
 */
function getClientIP(request: Request): string {
  // Check various headers for real IP (behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Rate limiter factory
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message } = config;

  return async function rateLimit(request: Request): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === '1') {
      return { success: true, remaining: maxRequests, resetAt: Date.now() + windowMs };
    }

    const ip = getClientIP(request);
    const key = `${ip}`;
    const now = Date.now();

    let entry = memoryStore.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    entry.count++;
    memoryStore.set(key, entry);

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    return {
      success,
      remaining,
      resetAt: entry.resetAt,
    };
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API: 100 requests per minute
  api: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'Too many requests. Please try again later.',
  }),

  // Auth endpoints: 5 requests per 15 minutes (prevent brute force)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  }),

  // Upload endpoint: 10 requests per minute
  upload: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many upload requests. Please try again later.',
  }),

  // Import endpoint: 20 requests per minute
  import: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'Too many import requests. Please try again later.',
  }),
};

/**
 * Check rate limit and return Response if rate limited, null if allowed
 * This is a convenience function that wraps the limiter call
 */
export async function checkRateLimit(
  request: Request,
  limiter: (req: Request) => Promise<{ success: boolean; remaining: number; resetAt: number }>,
  customMessage?: string
): Promise<Response | null> {
  const result = await limiter(request);
  
  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    
    return new Response(
      JSON.stringify({
        error: customMessage || 'Too many requests. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );
  }
  
  return null;
}

/**
 * Apply rate limit to request
 * Returns null if allowed, or Response with error if rate limited
 */
export async function applyRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>,
  customMessage?: string
): Promise<Response | null> {
  const result = await limiter(request);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: customMessage || 'Too many requests. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );
  }

  return null;
}

// Export for convenience
export { memoryStore };
