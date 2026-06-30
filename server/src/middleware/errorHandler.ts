import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack, name: err.name });

  // ── Prisma Known Request Errors ──────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        res.status(409).json({
          success: false,
          message: `A record with this ${field} already exists`,
        });
        return;
      }
      case 'P2025':
        res.status(404).json({ success: false, message: 'Record not found' });
        return;
      case 'P2003':
        res.status(400).json({ success: false, message: 'Related record not found' });
        return;
      default:
        res.status(400).json({ success: false, message: 'Database error', code: err.code });
        return;
    }
  }

  // ── Prisma Validation Error ──────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data provided to database' });
    return;
  }

  // ── Zod Validation Error ─────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ── JWT Errors ───────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token has expired' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  // ── Custom HTTP Errors ───────────────────────────────────────────
  if ('statusCode' in err) {
    const httpErr = err as Error & { statusCode: number };
    res.status(httpErr.statusCode).json({ success: false, message: err.message });
    return;
  }

  // ── Generic 500 ──────────────────────────────────────────────────
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : err.message,
  });
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}
