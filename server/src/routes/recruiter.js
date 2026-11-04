import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { requireAuth, requireCapability } from '../auth.js';
import { serializeApplication, serializeJob, toEnum } from '../serialize.js';
import { snapshotPatch } from '../snapshot.js';
import { publicId } from '../ids.js';
import { recordActivity } from '../events.js';

const router = Router();

// Scoped to this router's own prefix: a bare `router.use` here would also guard every request
// that falls through from an earlier router, so a developer hitting an unknown path would be
// told they need recruiter rights instead of getting a 404.
router.use('/recruiter', requireAuth, requireCapability('recruiter'));

const Salary = z
  .object({ min: z.number().int().nonnegative(), max: z.number().int().nonnegative(), currency: z.string().max(8).default('USD'), period: z.enum(['year', 'month']).default('year') })
  .nullable()
  .optional();

const JobInput = z.object({
  title: z.string().trim().min(3).max(140),
  location: z.string().trim().min(2).max(120),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']),
  salary: Salary,
  requiredSkills: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  preferredSkills: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  description: z.string().trim().min(20).max(8000),
  responsibilities: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
  applyDeadline: z.string().datetime({ offset: true }).optional().or(z.literal('')),
});

const ownedJob = async (id, recruiterId) => {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new ApiError(404, 'not_found', 'That posting no longer exists.');
  if (job.recruiterId !== recruiterId) throw new ApiError(403, 'forbidden', 'You can only manage postings you own.');
  return job;
};

router.get(
  '/recruiter/jobs',
  route(async (req, res) => {
    const rows = await prisma.job.findMany({ where: { recruiterId: req.user.id }, orderBy: { postedAt: 'desc' } });
    res.json({ ok: true, items: rows.map(serializeJob) });
  }),
);

router.post(
  '/recruiter/jobs',
  route(async (req, res) => {
    const input = parse(JobInput, req.body);
    if (!req.user.companyId) throw new ApiError(409, 'no_company', 'Add a company to your recruiter profile before posting.');

    const job = await prisma.$transaction(async (tx) => {
      const created = await tx.job.create({
        data: {
          id: publicId('job'),
          title: input.title,
          companyId: req.user.companyId,
          recruiterId: req.user.id,
          location: input.location,
          workMode: input.workMode,
          jobType: toEnum(input.jobType),
          experienceLevel: input.experienceLevel,
          salary: input.salary ?? null,
          requiredSkills: input.requiredSkills,
          preferredSkills: input.preferredSkills,
          description: input.description,
          responsibilities: input.responsibilities,
          status: input.status,
          postedAt: new Date(),
          applyDeadline: input.applyDeadline ? new Date(input.applyDeadline) : null,
        },
      });
      await recordActivity(tx, { actorId: req.user.id, kind: 'posted-job', targetId: created.id });
      return created;
    });

    res.status(201).json({ ok: true, job: serializeJob(job), patch: await snapshotPatch(['jobs', 'activity']) });
  }),
);

router.patch(
  '/recruiter/jobs/:id',
  route(async (req, res) => {
    const job = await ownedJob(req.params.id, req.user.id);
    const input = parse(JobInput.partial(), req.body);

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.location && { location: input.location }),
        ...(input.workMode && { workMode: input.workMode }),
        ...(input.jobType && { jobType: toEnum(input.jobType) }),
        ...(input.experienceLevel && { experienceLevel: input.experienceLevel }),
        ...(input.salary !== undefined && { salary: input.salary ?? null }),
        ...(input.requiredSkills && { requiredSkills: input.requiredSkills }),
        ...(input.preferredSkills && { preferredSkills: input.preferredSkills }),
        ...(input.description && { description: input.description }),
        ...(input.responsibilities && { responsibilities: input.responsibilities }),
        ...(input.status && { status: input.status }),
        ...(input.applyDeadline !== undefined && { applyDeadline: input.applyDeadline ? new Date(input.applyDeadline) : null }),
      },
    });

    res.json({ ok: true, job: serializeJob(updated), patch: await snapshotPatch(['jobs']) });
  }),
);

router.put(
  '/recruiter/jobs/:id/status',
  route(async (req, res) => {
    const job = await ownedJob(req.params.id, req.user.id);
    const { status } = parse(z.object({ status: z.enum(['draft', 'published', 'closed']) }), req.body);
    const updated = await prisma.job.update({ where: { id: job.id }, data: { status } });
    res.json({ ok: true, job: serializeJob(updated), patch: await snapshotPatch(['jobs']) });
  }),
);

router.delete(
  '/recruiter/jobs/:id',
  route(async (req, res) => {
    const job = await ownedJob(req.params.id, req.user.id);
    // Applications cascade; a recruiter deleting a live posting therefore also erases the
    // candidates' history, so the client confirms it first.
    await prisma.job.delete({ where: { id: job.id } });
    res.json({ ok: true, patch: await snapshotPatch(['jobs', 'applications', 'notifications', 'savedJobs']) });
  }),
);

router.get(
  '/recruiter/applications',
  route(async (req, res) => {
    const rows = await prisma.application.findMany({
      where: { job: { recruiterId: req.user.id } },
      include: { events: true, job: true, user: { include: { company: true } } },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({
      ok: true,
      items: rows.map((row) => ({
        ...serializeApplication(row),
        job: serializeJob(row.job),
        candidate: row.user,
      })),
    });
  }),
);

export default router;
