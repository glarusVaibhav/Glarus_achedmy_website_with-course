import prisma from '@/lib/db';

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

/**
 * Database-backed rate limiter.
 * Uses the RateLimit table in PostgreSQL.
 * Can be swapped for Redis later without changing the API.
 *
 * @param key - Unique identifier (e.g. "otp_send:user@example.com")
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();

  // Clean up expired entries periodically (1% chance per call to avoid overhead)
  if (Math.random() < 0.01) {
    await prisma.rateLimit.deleteMany({
      where: { expiresAt: { lt: now } },
    }).catch(() => {}); // Non-critical cleanup
  }

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.expiresAt < now) {
    // No record or expired — create/reset
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now, expiresAt },
      update: { count: 1, windowStart: now, expiresAt },
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil(
      (existing.expiresAt.getTime() - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  // Increment count
  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: maxRequests - existing.count - 1 };
}
