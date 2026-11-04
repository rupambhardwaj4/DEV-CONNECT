import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { requireAuth } from '../auth.js';
import { serializeActivity, serializeJob, serializeProject, serializeRepository, serializeUser } from '../serialize.js';
import { actsAs, computeProfileCompletion, describeActivity, rankJobs } from '../domain.js';

const router = Router();

/** Repeated params and comma-separated lists both mean the same filter. */
const list = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined) return [];
    const raw = Array.isArray(value) ? value : value.split(',');
    return raw.map((s) => String(s).trim()).filter(Boolean);
  });

const JobQuery = z.object({
  query: z.string().trim().max(120).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  workMode: list,
  jobType: list,
  experienceLevel: list,
  requiredSkills: list,
  minSalary: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(['all', 'draft', 'published', 'closed']).optional(),
  sort: z.enum(['recent', 'match', 'salary-high', 'salary-low', 'soonest', 'title']).default('recent'),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
});

const DeveloperQuery = z.object({
  query: z.string().trim().max(120).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  experienceLevel: list,
  skills: list,
  openTo: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(12),
});

const contains = (haystack, needle) => String(haystack ?? '').toLowerCase().includes(String(needle).toLowerCase());

function filterJobs(rows, input) {
  return rows.filter((job) => {
    if (input.status === 'all') {
      /* recruiter scope: drafts and closed postings stay in the list */
    } else if (input.status) {
      if (job.status !== input.status) return false;
    } else if (job.status === 'draft') {
      return false;
    }
    if (input.location && !contains(job.location, input.location)) return false;
    if (input.workMode.length && !input.workMode.includes(job.workMode)) return false;
    if (input.jobType.length && !input.jobType.includes(job.jobType)) return false;
    if (input.experienceLevel.length && !input.experienceLevel.includes(job.experienceLevel)) return false;
    if (input.requiredSkills.length) {
      const pool = [...job.requiredSkills, ...job.preferredSkills].map((s) => s.toLowerCase());
      if (!input.requiredSkills.every((skill) => pool.includes(skill.toLowerCase()))) return false;
    }
    if (input.minSalary && (!job.salary || job.salary.min < input.minSalary)) return false;
    if (input.query) {
      const haystack = [job.title, job.location, job.description, ...job.requiredSkills, ...job.preferredSkills];
      if (!haystack.some((field) => contains(field, input.query))) return false;
    }
    return true;
  });
}

function sortJobs(rows, input, matchScores) {
  const sorted = [...rows];
  if (input.sort === 'match' && matchScores) {
    return sorted.sort((a, b) => matchScores.get(b.id).score - matchScores.get(a.id).score || a.id.localeCompare(b.id));
  }
  if (input.sort === 'salary-high') return sorted.sort((a, b) => (b.salary?.min ?? 0) - (a.salary?.min ?? 0));
  if (input.sort === 'salary-low') return sorted.sort((a, b) => (a.salary?.min ?? 0) - (b.salary?.min ?? 0));
  if (input.sort === 'soonest') {
    return sorted.sort((a, b) => Date.parse(a.applyDeadline ?? '9999-12-31') - Date.parse(b.applyDeadline ?? '9999-12-31'));
  }
  if (input.sort === 'title') return sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted.sort((a, b) => b.postedAt - a.postedAt);
}

async function perUserJobIds(userId) {
  const [saved, applied] = await Promise.all([
    prisma.savedJob.findMany({ where: { userId }, select: { jobId: true } }),
    prisma.application.findMany({ where: { userId }, select: { jobId: true } }),
  ]);
  return { savedIds: new Set(saved.map((row) => row.jobId)), appliedIds: new Set(applied.map((row) => row.jobId)) };
}

/** Adds the derived fields the board and detail pages read: company, match, saved, applied, counts. */
async function decorate(job, { developer, match, savedIds, appliedIds, applicantCount }) {
  const [company, recruiter] = await Promise.all([
    job.company ?? prisma.company.findUnique({ where: { id: job.companyId } }),
    job.recruiter ?? prisma.user.findUnique({ where: { id: job.recruiterId } }),
  ]);
  return {
    ...serializeJob(job),
    company: company ? { id: company.id, name: company.name, logoText: company.logoText ?? undefined } : null,
    recruiter: recruiter ? serializeUser(recruiter) : null,
    match: match ?? (developer ? rankJobs(developer, [job])[0].match : null),
    isSaved: savedIds?.has(job.id) ?? false,
    hasApplied: appliedIds?.has(job.id) ?? false,
    applicantCount,
  };
}

router.get(
  '/jobs',
  requireAuth,
  route(async (req, res) => {
    const input = parse(JobQuery, req.query);
    const [rows, counts] = await Promise.all([
      prisma.job.findMany({ include: { company: true, recruiter: true } }),
      prisma.application.groupBy({ by: ['jobId'], _count: { _all: true } }),
    ]);
    const applicantCounts = new Map(counts.map((row) => [row.jobId, row._count._all]));
    const { savedIds, appliedIds } = await perUserJobIds(req.user.id);

    const filtered = filterJobs(rows, input);
    const matchScores =
      input.sort === 'match'
        ? new Map(filtered.map((job) => [job.id, rankJobs(req.user, [job])[0].match]))
        : null;
    const sorted = sortJobs(filtered, input, matchScores);

    const start = (input.page - 1) * input.perPage;
    const items = await Promise.all(
      sorted
        .slice(start, start + input.perPage)
        .map((job) =>
          decorate(job, {
            developer: req.user,
            match: matchScores?.get(job.id) ?? null,
            savedIds,
            appliedIds,
            applicantCount: applicantCounts.get(job.id) ?? 0,
          }),
        ),
    );

    res.json({
      ok: true,
      items,
      total: sorted.length,
      page: input.page,
      perPage: input.perPage,
      totalPages: Math.max(1, Math.ceil(sorted.length / input.perPage)),
    });
  }),
);

router.get(
  '/jobs/facets',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.job.findMany({
      select: {
        workMode: true,
        jobType: true,
        experienceLevel: true,
        requiredSkills: true,
        preferredSkills: true,
        company: { select: { name: true } },
      },
    });
    const skills = new Set();
    for (const job of rows) for (const skill of [...job.requiredSkills, ...job.preferredSkills]) skills.add(skill);

    res.json({
      ok: true,
      facets: {
        workModes: [...new Set(rows.map((job) => job.workMode))].sort(),
        jobTypes: [...new Set(rows.map((job) => job.jobType))].sort(),
        experienceLevels: ['junior', 'mid', 'senior', 'lead', 'principal'].filter((level) =>
          rows.some((job) => job.experienceLevel === level),
        ),
        companies: [...new Set(rows.map((job) => job.company?.name).filter(Boolean))].sort(),
        skills: [...skills].sort(),
      },
    });
  }),
);

router.get(
  '/jobs/:id',
  requireAuth,
  route(async (req, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true, recruiter: true } });
    if (!job) throw new ApiError(404, 'not_found', 'That posting is no longer on the board.');

    const [{ savedIds, appliedIds }, applicantCount] = await Promise.all([
      perUserJobIds(req.user.id),
      prisma.application.count({ where: { jobId: job.id } }),
    ]);

    res.json({
      ok: true,
      job: await decorate(job, { developer: req.user, savedIds, appliedIds, applicantCount }),
    });
  }),
);

router.get(
  '/developers',
  requireAuth,
  route(async (req, res) => {
    const input = parse(DeveloperQuery, req.query);
    const rows = await prisma.user.findMany({ where: { role: 'developer' }, include: { company: true } });

    const filtered = rows.filter((user) => {
      if (user.visibility === 'private' && user.id !== req.user.id) return false;
      if (input.location && !contains(user.location, input.location)) return false;
      if (input.experienceLevel.length && !input.experienceLevel.includes(user.experienceLevel ?? '')) return false;
      if (input.openTo && user.openTo !== input.openTo) return false;
      if (input.skills.length && !input.skills.every((skill) => user.skills.some((have) => contains(have, skill)))) return false;
      if (input.query) {
        const haystack = [user.name, user.headline, user.location, user.bio, ...user.skills];
        if (!haystack.some((field) => contains(field, input.query))) return false;
      }
      return true;
    });

    const start = (input.page - 1) * input.perPage;
    res.json({
      ok: true,
      items: filtered.slice(start, start + input.perPage).map(serializeUser),
      total: filtered.length,
      page: input.page,
      perPage: input.perPage,
      totalPages: Math.max(1, Math.ceil(filtered.length / input.perPage)),
    });
  }),
);

/**
 * One developer, with everything the profile screen renders under it.
 *
 * Mirrors `store.getDeveloperDetail` field for field, so the same component can be handed
 * served data. Capability decides visibility, not the literal role: the review account
 * carries a full developer profile and must be viewable by link like any other.
 */
router.get(
  '/developers/:id',
  requireAuth,
  route(async (req, res) => {
    const developer = await prisma.user.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (!developer || !actsAs(developer.role, 'developer')) {
      throw new ApiError(404, 'not_found', 'That developer profile does not exist.');
    }

    // Both people's links in one read, in every state: the pair state and the mutual count
    // come out of the same rows.
    const involvingEither = [
      { fromUserId: req.user.id },
      { toUserId: req.user.id },
      { fromUserId: developer.id },
      { toUserId: developer.id },
    ];
    const [repositories, projects, links, activityRows] = await Promise.all([
      prisma.repository.findMany({ where: { userId: developer.id } }),
      prisma.project.findMany({ where: { userId: developer.id } }),
      prisma.connection.findMany({ where: { OR: involvingEither } }),
      prisma.activityEvent.findMany({
        where: { OR: [{ targetId: developer.id }, { actorId: developer.id }] },
        include: { actor: { include: { company: true } } },
        orderBy: { at: 'desc' },
        take: 30,
      }),
    ]);

    const between = (a, b) =>
      links.find((row) => (row.fromUserId === a && row.toUserId === b) || (row.fromUserId === b && row.toUserId === a));

    const acceptedPartnerIds = new Set(
      links
        .filter((row) => row.state === 'accepted' && (row.fromUserId === req.user.id || row.toUserId === req.user.id))
        .map((row) => (row.fromUserId === req.user.id ? row.toUserId : row.fromUserId)),
    );
    acceptedPartnerIds.delete(developer.id);
    const mutualConnections = [...acceptedPartnerIds].filter((otherId) => between(otherId, developer.id)?.state === 'accepted').length;

    // The sentence templates need a name for a person id and a title for a job id, and which
    // one a row needs depends on its kind — so resolve exactly the ids the rows reference.
    const peopleIds = new Set();
    const jobIds = new Set();
    for (const row of activityRows) {
      (ACTIVITY_TARGET_IS_JOB.has(row.kind) ? jobIds : peopleIds).add(row.targetId);
    }
    const [jobRows, people] = await Promise.all([
      jobIds.size ? prisma.job.findMany({ where: { id: { in: [...jobIds] } }, select: { id: true, title: true } }) : [],
      peopleIds.size
        ? prisma.user.findMany({ where: { id: { in: [...peopleIds] } }, select: { id: true, name: true } })
        : [],
    ]);
    const see = {
      nameOf: (userId) =>
        userId === req.user.id ? req.user.name : (people.find((person) => person.id === userId)?.name ?? 'someone'),
      jobTitleOf: (jobId) => jobRows.find((job) => job.id === jobId)?.title ?? null,
    };

    const activity = activityRows
      .map((row) => {
        const actor = row.actorId === req.user.id ? req.user : row.actor;
        const base = { ...serializeActivity(row), actor: serializeUser(actor) };
        const text = describeActivity(base, req.user.id, see);
        return text ? { ...base, text } : null;
      })
      .filter(Boolean)
      .slice(0, 6);

    const publicDeveloper = serializeUser(developer);
    res.json({
      ok: true,
      developer: {
        ...publicDeveloper,
        company: null,
        repositories: repositories
          .map(serializeRepository)
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.stars - a.stars),
        projects: projects.map(serializeProject),
        connectionState: connectionStateFor(req.user.id, developer.id, between(req.user.id, developer.id)),
        mutualConnections,
        activity,
        profileCompletion: computeProfileCompletion(publicDeveloper, projects.length > 0),
      },
    });
  }),
);

/** Kinds whose targetId points at a job rather than a person. */
const ACTIVITY_TARGET_IS_JOB = new Set(['posted-job', 'applied']);

/** 'self' | 'none' | 'connected' | 'outgoing' | 'incoming' | 'declined' for a pair. */
function connectionStateFor(viewerId, otherId, pair) {
  if (viewerId === otherId) return 'self';
  if (!pair) return 'none';
  if (pair.state === 'accepted') return 'connected';
  if (pair.state === 'rejected') return 'declined';
  return pair.fromUserId === viewerId ? 'outgoing' : 'incoming';
}

/** The advisory match list: every published role scored against the signed-in profile. */router.get(
  '/matches',
  requireAuth,
  route(async (req, res) => {
    const input = parse(
      z.object({ minScore: z.coerce.number().int().min(0).max(100).default(0), sort: z.enum(['match', 'recent']).default('match') }),
      req.query,
    );
    const [rows, saved] = await Promise.all([
      prisma.job.findMany({ where: { status: 'published' }, include: { company: true, recruiter: true } }),
      prisma.savedJob.findMany({ where: { userId: req.user.id }, select: { jobId: true } }),
    ]);
    const savedIds = new Set(saved.map((row) => row.jobId));

    const ranked = rankJobs(serializeUser(req.user), rows.map(serializeJob), req.user.preferences ?? {})
      .filter((entry) => entry.match.score >= input.minScore)
      .map((entry) => ({ ...entry, job: { ...entry.job, company: null, isSaved: savedIds.has(entry.job.id) } }));

    if (input.sort === 'recent') ranked.sort((a, b) => Date.parse(b.job.postedAt) - Date.parse(a.job.postedAt));

    res.json({ ok: true, items: ranked, weights: { required: 60, preferred: 15, experience: 15, workMode: 10 } });
  }),
);

export default router;
