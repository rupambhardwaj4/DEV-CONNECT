import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from './config.js';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Wraps an async handler so a rejected promise reaches the error middleware. */
export const route = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/**
 * `?? {}` matters: a POST with no body at all arrives as `undefined` in Express 5, and an
 * endpoint whose fields are all optional must answer the business rule (409 already applied),
 * not a validation error about a body nobody sent.
 */
export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new ApiError(422, 'validation_failed', 'The request body is not valid.', {
      fields: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  return result.data;
}

export const optionalId = z.string().trim().min(1).max(64);

/**
 * Prisma and application errors share one JSON envelope so the client can branch on
 * `code` instead of guessing from status text.
 */
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({ ok: false, code: error.code, error: error.message, details: error.details });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        ok: false,
        code: 'duplicate',
        error: 'That record already exists.',
        details: { fields: error.meta?.target },
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ ok: false, code: 'not_found', error: 'That record no longer exists.' });
    }
  }

  console.error('[api] unhandled', error);
  return res.status(500).json({
    ok: false,
    code: 'internal_error',
    error: 'The server could not complete the request.',
    details: config.isProduction ? undefined : { message: error.message },
  });
}

export function notFound(req, res) {
  res.status(404).json({ ok: false, code: 'not_found', error: `No route for ${req.method} ${req.path}` });
}
