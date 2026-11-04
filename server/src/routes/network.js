import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { requireAuth, requireCapability } from '../auth.js';
import { serializeConnection, serializeUser } from '../serialize.js';
import { snapshotPatch } from '../snapshot.js';
import { publicId } from '../ids.js';
import { notify, recordActivity } from '../events.js';

const router = Router();

/** Both directions of a pair, so a request is never duplicated in the reverse lane. */
async function findPair(a, b) {
  return prisma.connection.findFirst({
    where: { OR: [{ fromUserId: a, toUserId: b }, { fromUserId: b, toUserId: a }] },
  });
}

router.get(
  '/connections',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.connection.findMany({
      where: { OR: [{ fromUserId: req.user.id }, { toUserId: req.user.id }], state: 'accepted' },
      orderBy: { respondedAt: 'desc' },
    });
    res.json({ ok: true, items: rows.map(serializeConnection) });
  }),
);

router.get(
  '/connections/requests',
  requireAuth,
  route(async (req, res) => {
    const [incoming, outgoing] = await Promise.all([
      prisma.connection.findMany({ where: { toUserId: req.user.id, state: 'pending' }, orderBy: { requestedAt: 'desc' } }),
      prisma.connection.findMany({ where: { fromUserId: req.user.id, state: 'pending' }, orderBy: { requestedAt: 'desc' } }),
    ]);
    res.json({ ok: true, incoming: incoming.map(serializeConnection), outgoing: outgoing.map(serializeConnection) });
  }),
);

router.post(
  '/connections',
  requireAuth,
  route(async (req, res) => {
    const { toUserId, message } = parse(
      z.object({ toUserId: z.string().min(1).max(64), message: z.string().trim().max(600).default('') }),
      req.body,
    );

    if (toUserId === req.user.id) throw new ApiError(422, 'self_connection', 'You cannot send a connection request to yourself.');
    const target = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!target) throw new ApiError(404, 'not_found', 'That developer no longer has a profile.');

    const existing = await findPair(req.user.id, target.id);
    if (existing?.state === 'pending') throw new ApiError(409, 'already_pending', 'A request between you two is already waiting.');
    if (existing?.state === 'accepted') throw new ApiError(409, 'already_connected', 'You are already connected.');

    const row = await prisma.$transaction(async (tx) => {
      if (existing?.state === 'rejected') await tx.connection.delete({ where: { id: existing.id } });
      const created = await tx.connection.create({
        data: { id: publicId('conn'), fromUserId: req.user.id, toUserId: target.id, state: 'pending', message: message || null },
      });
      await notify(tx, {
        userId: target.id,
        kind: 'connection_request',
        title: `${req.user.name} wants to connect`,
        body: message || `${req.user.headline || req.user.role} · ${req.user.location}`,
        href: `/developers/${req.user.id}`,
        relatedId: created.id,
      });
      await recordActivity(tx, { actorId: req.user.id, kind: 'sent-request', targetId: target.id });
      return created;
    });

    res.status(201).json({ ok: true, connection: serializeConnection(row), patch: await snapshotPatch(['connections', 'notifications', 'activity']) });
  }),
);

async function respond(req, accept) {
  const request = await prisma.connection.findUnique({ where: { id: req.params.id } });
  if (!request || request.toUserId !== req.user.id || request.state !== 'pending') {
    throw new ApiError(404, 'not_found', 'That request is no longer waiting on you.');
  }
  const { note } = parse(z.object({ note: z.string().trim().max(600).optional() }), req.body);
  const at = new Date();

  await prisma.$transaction(async (tx) => {
    if (accept) {
      await tx.connection.update({ where: { id: request.id }, data: { state: 'accepted', respondedAt: at, message: note ?? request.message } });
      await notify(tx, {
        userId: request.fromUserId,
        kind: 'connection_accepted',
        title: `${req.user.name} accepted your request`,
        body: note || 'You can now see each other’s shared context.',
        href: `/developers/${req.user.id}`,
        relatedId: request.id,
      });
      await recordActivity(tx, { actorId: req.user.id, kind: 'accepted-request', targetId: request.fromUserId });
    } else {
      await tx.connection.update({ where: { id: request.id }, data: { state: 'rejected', respondedAt: at, message: note ?? request.message } });
    }
  });

  return snapshotPatch(['connections', 'notifications', 'activity']);
}

router.post('/connections/:id/accept', requireAuth, route(async (req, res) => res.json({ ok: true, patch: await respond(req, true) })));
router.post('/connections/:id/decline', requireAuth, route(async (req, res) => res.json({ ok: true, patch: await respond(req, false) })));

router.delete(
  '/connections/:id',
  requireAuth,
  route(async (req, res) => {
    const request = await prisma.connection.findUnique({ where: { id: req.params.id } });
    if (!request) throw new ApiError(404, 'not_found', 'That request no longer exists.');
    // Withdrawing a pending request or dissolving an accepted connection: either way you must
    // be one of the two people on it.
    if (![request.fromUserId, request.toUserId].includes(req.user.id)) {
      throw new ApiError(403, 'forbidden', 'That connection is not yours to remove.');
    }
    await prisma.connection.delete({ where: { id: request.id } });
    res.json({ ok: true, patch: await snapshotPatch(['connections']) });
  }),
);

// ------------------------------------------------------------------ shortlists

router.get(
  '/saved-jobs',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.savedJob.findMany({ where: { userId: req.user.id }, orderBy: { savedAt: 'desc' } });
    res.json({ ok: true, items: rows.map((row) => row.jobId) });
  }),
);

router.put(
  '/saved-jobs/:jobId',
  requireAuth,
  route(async (req, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) throw new ApiError(404, 'not_found', 'That posting is no longer on the board.');
    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
      create: { userId: req.user.id, jobId: job.id },
      update: {},
    });
    res.json({ ok: true, patch: await snapshotPatch(['savedJobs']) });
  }),
);

router.delete(
  '/saved-jobs/:jobId',
  requireAuth,
  route(async (req, res) => {
    await prisma.savedJob.deleteMany({ where: { userId: req.user.id, jobId: req.params.jobId } });
    res.json({ ok: true, patch: await snapshotPatch(['savedJobs']) });
  }),
);

router.put(
  '/saved-candidates/:developerId',
  requireAuth,
  requireCapability('recruiter'),
  route(async (req, res) => {
    const developer = await prisma.user.findUnique({ where: { id: req.params.developerId } });
    if (!developer) throw new ApiError(404, 'not_found', 'That candidate no longer has a profile.');
    await prisma.savedCandidate.upsert({
      where: { userId_developerId: { userId: req.user.id, developerId: developer.id } },
      create: { userId: req.user.id, developerId: developer.id },
      update: {},
    });
    res.json({ ok: true, patch: await snapshotPatch(['savedCandidates']) });
  }),
);

router.delete(
  '/saved-candidates/:developerId',
  requireAuth,
  requireCapability('recruiter'),
  route(async (req, res) => {
    await prisma.savedCandidate.deleteMany({ where: { userId: req.user.id, developerId: req.params.developerId } });
    res.json({ ok: true, patch: await snapshotPatch(['savedCandidates']) });
  }),
);

/** Saved candidate rows with the live profile attached, the shape the shortlist screen renders. */
router.get(
  '/saved-candidates',
  requireAuth,
  requireCapability('recruiter'),
  route(async (req, res) => {
    const rows = await prisma.savedCandidate.findMany({
      where: { userId: req.user.id },
      include: { developer: { include: { company: true } } },
      orderBy: { savedAt: 'desc' },
    });
    res.json({ ok: true, items: rows.map((row) => serializeUser(row.developer)) });
  }),
);

export default router;
