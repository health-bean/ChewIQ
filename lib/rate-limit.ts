/**
 * Rate limiter backed by Upstash Redis when configured,
 * with automatic in-memory fallback for local development.
 *
 * Redis-backed limits persist across serverless cold starts.
 * In-memory limits reset on cold starts (acceptable for local dev).
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { log } from "@/lib/logger";

// ── Redis-backed rate limiters (lazy init) ──────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }

  return null;
}

// Cache Ratelimit instances by config key to avoid recreating
const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(config: RateLimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const key = `${config.limit}:${config.windowSeconds}`;
  let limiter = redisLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
      prefix: "rl",
    });
    redisLimiters.set(key, limiter);
  }
  return limiter;
}

// ── In-memory fallback ──────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

function memoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ── Public API ──────────────────────────────────────────────────────

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit a request by key (typically userId:IP).
 * Uses Upstash Redis when configured, falls back to in-memory.
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redisLimiter = getRedisLimiter(config);

  if (redisLimiter) {
    try {
      const result = await redisLimiter.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch (err) {
      log.warn("redis rate limit failed, falling back to memory", {
        error: err as Error,
      });
    }
  }

  // Fallback to in-memory
  return memoryRateLimit(key, config);
}

/**
 * Extract client IP from request headers.
 * Works with Vercel (x-forwarded-for) and direct connections.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Pre-configured limiters for common use cases
export const AUTH_RATE_LIMIT = { limit: 10, windowSeconds: 300 } as const;
export const SIGNUP_RATE_LIMIT = { limit: 5, windowSeconds: 600 } as const;
export const PASSWORD_RESET_RATE_LIMIT = { limit: 3, windowSeconds: 600 } as const;
export const CHAT_RATE_LIMIT = { limit: 30, windowSeconds: 60 } as const;
export const ADMIN_CHAT_RATE_LIMIT = { limit: 60, windowSeconds: 60 } as const;
