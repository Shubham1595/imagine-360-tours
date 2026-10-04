import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ENV } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isProd = ENV.NODE_ENV === 'production';
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Log full error details server-side
  console.error(`[${errorId}] API Error:`, {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: isProd ? undefined : err.stack,
  });

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: formattedErrors || 'Validation failed',
      details: isProd ? undefined : err.flatten(),
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    res.status(409).json({
      success: false,
      error: `A record with this ${target} already exists.`,
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Record not found.',
    });
    return;
  }

  // Handle Prisma / Database Driver Errors
  if (err.name?.includes('Prisma') || (err.code && String(err.code).startsWith('P'))) {
    res.status(500).json({
      success: false,
      error: isProd ? 'A database operation error occurred. Please contact support.' : err.message,
      errorId: isProd ? errorId : undefined,
    });
    return;
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);

  // In production, mask unhandled 5xx server exceptions
  if (statusCode >= 500 && isProd) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      errorId,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.',
  });
}

