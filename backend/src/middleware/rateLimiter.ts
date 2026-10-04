import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRequestMap.entries()) {
    if (now > record.resetAt) {
      ipRequestMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Lightweight, zero-dependency in-memory rate limiter
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum allowed requests in the time window
 * @param message Custom error message
 */
export function rateLimiter(windowMs: number, maxRequests: number, message: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, bypass rate limits
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = ipRequestMap.get(key);

    if (!record || now > record.resetAt) {
      ipRequestMap.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

// 10 login attempts per 15 minutes per IP
export const authRateLimiter = rateLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts from this network. Please try again in a few minutes.'
);

// 15 public enquiries per 15 minutes per IP
export const publicEnquiryRateLimiter = rateLimiter(
  15 * 60 * 1000,
  15,
  'Enquiry submission limit reached. Please wait a few minutes before submitting again.'
);
