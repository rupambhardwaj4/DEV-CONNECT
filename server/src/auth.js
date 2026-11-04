import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { prisma } from './db.js';
import { ApiError } from './http.js';
import { actsAs } from './domain.js';
import { serializeUser } from './serialize.js';

export const COOKIE_NAME = 'devconnect_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProduction,
  path: '/',
  maxAge: 12 * 60 * 60 * 1000,
};

export function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_TTL });
}

export function sessionCookie(token) {
  return [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${COOKIE_OPTIONS.maxAge}`,
    ...(config.isProduction ? ['Secure'] : []),
  ].join('; ');
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function bearer(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

async function resolveSession(req) {
  const token = req.cookies?.[COOKIE_NAME] ?? bearer(req);
  if (!token) throw new ApiError(401, 'unauthenticated', 'Sign in to use this endpoint.');

  let payload;
  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'session_expired', 'Your session is no longer valid. Sign in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { company: true } });
  if (!user) throw new ApiError(401, 'session_expired', 'Your session is no longer valid. Sign in again.');
  return user;
}

/**
 * Every /api/v1 route below this line requires a live session.
 *
 * Deliberately a callback-style middleware wrapping an async lookup: a two-parameter async
 * function receives Express's `res` where it declares `next`, so the middleware "succeeds" by
 * throwing TypeError and every authenticated request 500s.
 */
export function requireAuth(req, res, next) {
  resolveSession(req)
    .then((user) => {
      req.user = user;
      req.publicUser = serializeUser(user);
      next();
    })
    .catch(next);
}

/**
 * Capability gate, not a literal role: a superuser acts as developer and recruiter, so one
 * `requireCapability('recruiter')` covers both the recruiter accounts and the review account.
 */
export function requireCapability(capability) {
  return (req, res, next) => {
    if (!actsAs(req.user.role, capability)) {
      return next(new ApiError(403, 'forbidden', `This action needs an account able to act as ${capability}.`));
    }
    return next();
  };
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, config.PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
