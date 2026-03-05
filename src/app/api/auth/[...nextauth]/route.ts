// app/api/auth/[...nextauth]/route.ts
import { NextRequest } from 'next/server';
import * as authHandlers from '@/auth';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';

// Get original handlers
const originalGET = authHandlers.GET;
const originalPOST = authHandlers.POST;

// Wrap POST with rate limiting (for login attempts)
async function POST(req: NextRequest): Promise<Response> {
  // 🔒 SECURITY: Rate limit login attempts to prevent brute force
  // Skip in test environment to avoid flaky E2E tests
  if (process.env.NODE_ENV !== 'test' && process.env.PLAYWRIGHT !== '1') {
    const rateLimitResponse = await checkRateLimit(req, rateLimiters.auth);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Forward to original NextAuth handler
  return originalPOST(req);
}

// Export GET as-is, POST with rate limiting
export const GET = originalGET;
export { POST };
