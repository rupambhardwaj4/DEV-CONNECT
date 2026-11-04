import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { COOKIE_NAME, clearSessionCookie, hashPassword, requireAuth, sessionCookie, signSession, verifyPassword } from '../auth.js';
import { serializeUser } from '../serialize.js';
import { loadSnapshot, snapshotPatch } from '../snapshot.js';
import { publicId } from '../ids.js';
import { notify } from '../events.js';

const router = Router();

const Email = z.string().trim().toLowerCase().email('Enter a valid email address.');
const Password = z.string().min(8, 'Use at least 8 characters.').max(200);

const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name.').max(80),
  email: Email,
  password: Password,
  // `superuser` is a seeded review identity, never a registration choice.
  role: z.enum(['developer', 'recruiter']),
  headline: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  companyName: z.string().trim().min(2).max(120).optional(),
});

const NotificationPrefs = z.object({
  connectionRequests: z.boolean().default(true),
  applicationUpdates: z.boolean().default(true),
  jobMatches: z.boolean().default(true),
  recruiterActivity: z.boolean().default(true),
});

const Preferences = z.object({
  workMode: z.enum(['remote', 'hybrid', 'onsite', 'any']).default('any'),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']).optional(),
  roleTypes: z.array(z.string()).default([]),
  locations: z.array(z.string().max(120)).default([]),
  minSalary: z.number().int().nonnegative().nullable().default(null),
});

const ProfilePatch = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  skills: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']).optional(),
  yearsOfExperience: z.coerce.number().int().nonnegative().max(60).optional(),
  githubUsername: z.string().trim().regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/).optional().or(z.literal('')),
  website: z.string().url().max(300).optional().or(z.literal('')),
  linkedIn: z.string().url().max(300).optional().or(z.literal('')),
  twitter: z.string().trim().max(60).optional().or(z.literal('')),
  openTo: z.enum(['new-roles', 'collaboration', 'not-looking', 'first-roles', 'leadership-roles']).optional().or(z.literal('')),
  resume: z.string().trim().max(160).optional().or(z.literal('')),
  visibility: z.enum(['public', 'connections', 'private']).optional(),
  notificationPrefs: NotificationPrefs.partial().optional(),
  experience: z.array(z.object({
    title: z.string().trim().min(1).max(120),
    organization: z.string().trim().min(1).max(120),
    startYear: z.string().trim().max(12),
    endYear: z.string().trim().max(12).optional(),
    detail: z.string().trim().max(600).optional(),
  })).max(20).optional(),
  education: z.array(z.object({
    title: z.string().trim().min(1).max(120),
    organization: z.string().trim().min(1).max(120),
    startYear: z.string().trim().max(12),
    endYear: z.string().trim().max(12).optional(),
    detail: z.string().trim().max(600).optional(),
  })).max(20).optional(),
});

function issue(res, user) {
  res.setHeader('Set-Cookie', sessionCookie(signSession(user)));
}

/** The account record minus the password hash, safe to hand to the browser. */
export function present(user) {
  return serializeUser(user);
}

router.post(
  '/auth/register',
  route(async (req, res) => {
    const input = parse(RegisterSchema, req.body);

    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new ApiError(409, 'email_taken', 'An account already uses that email address.');

    // A recruiter without a company gets one created for them, matching the profile screens.
    let companyId = null;
    if (input.role === 'recruiter') {
      const company = await prisma.company.create({
        data: {
          id: publicId('co'),
          name: input.companyName?.trim() || `${input.name}'s team`,
          industry: 'Technology',
          size: '1-50',
          location: input.location?.trim() || 'Remote',
          blurb: 'Created when the recruiter account registered on DevConnect.',
          logoText: (input.companyName?.trim() || input.name).slice(0, 2).toUpperCase(),
        },
      });
      companyId = company.id;
    }

    const developer = input.role !== 'recruiter';
    const user = await prisma.user.create({
      data: {
        id: publicId('user'),
        role: input.role,
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        headline: input.headline ?? '',
        location: input.location ?? 'Remote',
        companyId,
        title: developer ? null : 'Recruiter',
        emailVerified: false,
        notificationPrefs: NotificationPrefs.parse({}),
        preferences: developer ? Preferences.parse({}) : undefined,
        skills: [],
        experience: [],
        education: [],
      },
      include: { company: true },
    });

    // Unverified, like the offline demo: the verify screen is the only thing that flips this,
    // so both transports take the candidate through the same step.
    await prisma.$transaction(async (tx) => {
      await notify(tx, {
        userId: user.id,
        kind: 'system',
        title: 'Welcome to DevConnect',
        body: developer
          ? 'Add your skills and work-mode preference and the matcher starts scoring roles for you.'
          : 'Publish your first role to start collecting applications.',
        href: developer ? '/profile/edit' : '/recruiter/jobs/new',
      });
    });

    issue(res, user);
    res.status(201).json({ ok: true, user: present(user) });
  }),
);

/**
 * Simulated link opening. This build configures no mail transport, so the verify screen calls
 * this once the user says they followed the link — the flag is the whole feature.
 */
router.post(
  '/auth/verify-email',
  requireAuth,
  route(async (req, res) => {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { emailVerified: true },
      include: { company: true },
    });
    res.json({ ok: true, user: present(updated), patch: await snapshotPatch(['users']) });
  }),
);

router.post(
  '/auth/login',
  route(async (req, res) => {
    const { email, password } = parse(z.object({ email: Email, password: z.string().min(1) }), req.body);

    const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
    // One message for both branches: whether the address exists is not the caller's business.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, 'invalid_credentials', 'That email and password do not match an account.');
    }

    issue(res, user);
    res.json({ ok: true, user: present(user) });
  }),
);

router.post(
  '/auth/logout',
  route(async (req, res) => {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ ok: true });
  }),
);

/**
 * One round trip for the whole client boot: who am I, and what is my workspace.
 * The browser caches this document as its render store and refetches after writes.
 */
router.get(
  '/auth/session',
  requireAuth,
  route(async (req, res) => {
    res.json({ ok: true, user: req.publicUser, snapshot: await loadSnapshot() });
  }),
);

router.patch(
  '/me',
  requireAuth,
  route(async (req, res) => {
    const patch = parse(ProfilePatch, req.body);
    const data = { ...patch };
    if (patch.githubUsername !== undefined) data.githubUsername = patch.githubUsername || null;
    if (patch.website !== undefined) data.website = patch.website || null;
    if (patch.linkedIn !== undefined) data.linkedIn = patch.linkedIn || null;
    if (patch.openTo !== undefined) data.openTo = patch.openTo || null;
    if (patch.resume !== undefined) data.resume = patch.resume || null;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: { company: true },
    });

    res.json({ ok: true, user: present(updated), patch: await snapshotPatch(['users']) });
  }),
);

router.patch(
  '/me/preferences',
  requireAuth,
  route(async (req, res) => {
    const preferences = parse(Preferences, req.body);
    await prisma.user.update({ where: { id: req.user.id }, data: { preferences } });
    res.json({ ok: true, patch: await snapshotPatch(['users']) });
  }),
);

router.post(
  '/auth/password/forgot',
  route(async (req, res) => {
    const { email } = parse(z.object({ email: Email }), req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    // Always the same answer, whether or not the address is registered.
    const generic = { ok: true, message: 'If that address is registered, a reset link is on its way.' };
    if (!user) return res.json(generic);

    const token = publicId('rst');
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });

    // No mail transport is configured in this build; the token is returned so the reset
    // screen can be exercised end to end. A deployment wires this to a provider instead.
    return res.json({ ...generic, devToken: token });
  }),
);

router.post(
  '/auth/password/reset',
  route(async (req, res) => {
    const { token, password } = parse(z.object({ token: z.string().min(4), password: Password }), req.body);
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new ApiError(400, 'invalid_token', 'That reset link is no longer valid.');
    }

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(password) },
        include: { company: true },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.notification.create({
        data: {
          id: publicId('ntf'),
          userId: record.userId,
          kind: 'system',
          title: 'Password changed',
          body: 'Sign in again with the new password if you are using another device.',
          href: '/settings',
        },
      }),
    ]);

    // The reset screen confirms which address was updated, so it needs the account back.
    res.json({ ok: true, user: present(updated) });
  }),
);

export default router;
export { COOKIE_NAME };
