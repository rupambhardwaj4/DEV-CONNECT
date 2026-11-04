import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { requireAuth, requireCapability } from '../auth.js';
import { serializeApplication, serializeJob, toEnum } from '../serialize.js';
import { snapshotPatch } from '../snapshot.js';
import { publicId } from '../ids.js';
import { notify, recordActivity } from '../events.js';

const router = Router();

const STATUS_LITERALS = ['applied', 'under-review', 'interview', 'offer', 'rejected'];

router.get(
  '/applications',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: { events: true, job: { include: { company: true } } },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({
      ok: true,
      items: rows.map((row) => ({
        ...serializeApplication(row),
        job: row.job ? { ...serializeJob(row.job), company: row.job.company } : null,
      })),
    });
  }),
);

router.get(
  '/applications/:id',
  requireAuth,
  route(async (req, res) => {
    const row = await prisma.application.findFirst({
      // A developer reads their own application; the recruiter who owns the role reads theirs.
      where: { id: req.params.id, OR: [{ userId: req.user.id }, { job: { recruiterId: req.user.id } }] },
      include: { events: true, job: { include: { company: true } }, user: { include: { company: true } } },
    });
    if (!row) throw new ApiError(404, 'not_found', 'That application is not yours to read.');

    res.json({
      ok: true,
      application: {
        ...serializeApplication(row),
        job: { ...serializeJob(row.job), company: row.job.company },
        candidate: row.user,
      },
    });
  }),
);

router.post(
  '/jobs/:id/apply',
  requireAuth,
  requireCapability('developer'),
  route(async (req, res) => {
    const { coverNote } = parse(
      z.object({ coverNote: z.string().trim().max(4000).default('') }),
      req.body,
    );

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) throw new ApiError(404, 'not_found', 'That posting is no longer on the board.');
    if (job.status !== 'published') throw new ApiError(409, 'job_closed', 'That role is no longer accepting applications.');
    if (job.applyDeadline && job.applyDeadline.getTime() < Date.now()) {
      throw new ApiError(409, 'deadline_passed', 'The posting closed before you applied.');
    }

    const existing = await prisma.application.findUnique({ where: { jobId_userId: { jobId: job.id, userId: req.user.id } } });
    if (existing) throw new ApiError(409, 'already_applied', 'You have already applied to this role.');

    const at = new Date();
    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          id: publicId('app'),
          jobId: job.id,
          userId: req.user.id,
          status: 'applied',
          appliedAt: at,
          updatedAt: at,
          coverNote,
          events: { create: [{ status: 'applied', at, by: 'developer', note: 'Application sent.' }] },
        },
        include: { events: true },
      });

      await notify(tx, {
        userId: job.recruiterId,
        kind: 'applied',
        title: `${req.user.name} applied to ${job.title}`,
        body: coverNote ? coverNote.slice(0, 180) : 'Application sent with the profile note.',
        href: '/recruiter/applicants',
        relatedId: created.id,
      });
      await notify(tx, {
        userId: req.user.id,
        kind: 'application_update',
        title: 'Application sent',
        body: `${job.title} — status is Applied. Updates from the hiring team land here.`,
        href: `/applications/${created.id}`,
        relatedId: created.id,
      });
      await recordActivity(tx, { actorId: req.user.id, kind: 'applied', targetId: job.id });

      return created;
    });

    res.status(201).json({
      ok: true,
      application: serializeApplication(application),
      patch: await snapshotPatch(['applications', 'notifications', 'activity']),
    });
  }),
);

router.post(
  '/applications/:id/withdraw',
  requireAuth,
  route(async (req, res) => {
    const application = await prisma.application.findUnique({ where: { id: req.params.id }, include: { job: true } });
    if (!application || application.userId !== req.user.id) {
      throw new ApiError(404, 'not_found', 'That application is not yours to withdraw.');
    }
    if (application.status === 'withdrawn') throw new ApiError(409, 'already_withdrawn', 'That application is already withdrawn.');

    const at = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: application.id },
        data: { status: 'withdrawn', updatedAt: at, events: { create: [{ status: 'withdrawn', at, by: 'developer', note: 'Withdrawn by the candidate.' }] } },
      });
      await notify(tx, {
        userId: application.job.recruiterId,
        kind: 'recruiter_activity',
        title: `${req.user.name} withdrew an application`,
        body: `Pulled out of ${application.job.title}.`,
        href: '/recruiter/applicants',
        relatedId: application.id,
      });
    });

    res.json({ ok: true, patch: await snapshotPatch(['applications', 'notifications']) });
  }),
);

/** Recruiter-side status move, reachable by any account able to act as recruiter. */
router.patch(
  '/applications/:id/status',
  requireAuth,
  requireCapability('recruiter'),
  route(async (req, res) => {
    const input = parse(
      z.object({
        status: z.enum(STATUS_LITERALS),
        note: z.string().trim().max(600).optional(),
      }),
      req.body,
    );

    const application = await prisma.application.findUnique({ where: { id: req.params.id }, include: { job: true } });
    if (!application) throw new ApiError(404, 'not_found', 'That application no longer exists.');
    // Ownership: a recruiter can only move candidates on roles they posted.
    if (application.job.recruiterId !== req.user.id) {
      throw new ApiError(403, 'forbidden', 'Only the recruiter who posted this role can move its applicants.');
    }
    if (application.status === 'withdrawn') {
      throw new ApiError(409, 'withdrawn', 'The candidate already withdrew; the timeline is closed.');
    }

    const at = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: application.id },
        data: {
          status: toEnum(input.status),
          updatedAt: at,
          events: { create: [{ status: toEnum(input.status), at, by: 'recruiter', note: input.note ?? null }] },
        },
      });
      await notify(tx, {
        userId: application.userId,
        kind: 'application_update',
        title: `${application.job.title} moved to ${input.status.replace(/-/g, ' ')}`,
        body: input.note ?? 'The hiring team updated your application.',
        href: `/applications/${application.id}`,
        relatedId: application.id,
      });
    });

    res.json({ ok: true, patch: await snapshotPatch(['applications', 'notifications']) });
  }),
);

router.post(
  '/applications/:id/interview',
  requireAuth,
  requireCapability('recruiter'),
  route(async (req, res) => {
    const input = parse(
      z.object({ scheduledFor: z.string().min(4).max(80), note: z.string().trim().max(600).default('') }),
      req.body,
    );

    const application = await prisma.application.findUnique({ where: { id: req.params.id }, include: { job: true } });
    if (!application) throw new ApiError(404, 'not_found', 'That application no longer exists.');
    if (application.job.recruiterId !== req.user.id) {
      throw new ApiError(403, 'forbidden', 'Only the recruiter who posted this role can schedule its interview.');
    }

    const at = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: application.id },
        data: {
          status: 'interview',
          updatedAt: at,
          interview: { scheduledFor: input.scheduledFor, note: input.note },
          events: { create: [{ status: 'interview', at, by: 'recruiter', note: `Interview ${input.scheduledFor}.` }] },
        },
      });
      await notify(tx, {
        userId: application.userId,
        kind: 'application_update',
        title: `Interview scheduled for ${application.job.title}`,
        body: input.note || `Interview ${input.scheduledFor}.`,
        href: `/applications/${application.id}`,
        relatedId: application.id,
      });
    });

    res.json({ ok: true, patch: await snapshotPatch(['applications', 'notifications']) });
  }),
);

export default router;
