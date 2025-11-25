/**
 * In-memory rate limiting implementation
 * For production, consider using Redis or a dedicated rate limiting service
 */

import { NextRequest } from "next/server";
import { AppError, ErrorCode } from "./errors";

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests", details?: unknown) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
    this.name = "RateLimitError";
  }
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number;
  /**
   * Time window in seconds
   */
  windowSeconds: number;
  /**
   * Optional identifier function to customize how requests are tracked
   * Default: Uses IP address
   */
  identifier?: (request: NextRequest) => string;
}

/**
 * In-memory store for rate limit tracking
 * Note: This will reset when the server restarts
 * For production, use Redis or a persistent store
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (when behind a proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback (might be localhost in development)
  return "unknown";
}

/**
 * Rate limiting middleware
 *
 * @example
 * ```typescript
 * export const GET = withErrorHandler(
 *   rateLimit(async (request) => {
 *     // Your handler logic
 *   }, { maxRequests: 100, windowSeconds: 60 })
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rateLimit<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options: RateLimitOptions
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    const request = args[0] as NextRequest;

    // Get identifier (IP address or custom)
    const identifier = options.identifier
      ? options.identifier(request)
      : getClientIdentifier(request);

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Check if we have an existing entry
    if (entry) {
      // If the window has expired, reset the count
      if (entry.resetTime < now) {
        entry.count = 1;
        entry.resetTime = now + options.windowSeconds * 1000;
      } else {
        // Check if limit is exceeded
        if (entry.count >= options.maxRequests) {
          const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
          throw new RateLimitError(
            `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            {
              limit: options.maxRequests,
              window: options.windowSeconds,
              retryAfter,
            }
          );
        }

        entry.count++;
      }
    } else {
      // Create new entry
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + options.windowSeconds * 1000,
      });
    }

    // Call the original handler
    return handler(...args);
  }) as T;
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimitPresets = {
  /**
   * Strict rate limit for write operations (POST, PUT, DELETE)
   * 10 requests per minute
   */
  strict: { maxRequests: 10, windowSeconds: 60 },

  /**
   * Moderate rate limit for read operations
   * 100 requests per minute
   */
  moderate: { maxRequests: 100, windowSeconds: 60 },

  /**
   * Relaxed rate limit for public endpoints
   * 300 requests per minute
   */
  relaxed: { maxRequests: 300, windowSeconds: 60 },
};
