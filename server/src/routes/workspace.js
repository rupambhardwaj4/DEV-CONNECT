import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError, parse, route } from '../http.js';
import { requireAuth } from '../auth.js';
import { serializeActivity, serializeNotification, serializeProject, serializeRepository } from '../serialize.js';
import { snapshotPatch } from '../snapshot.js';
import { publicId } from '../ids.js';
import { config } from '../config.js';

const router = Router();

// ------------------------------------------------------------------ notifications

router.get(
  '/notifications',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({
      ok: true,
      items: rows.map(serializeNotification),
      unreadCount: rows.filter((row) => !row.read).length,
    });
  }),
);

router.post(
  '/notifications/:id/read',
  requireAuth,
  route(async (req, res) => {
    const { read } = parse(z.object({ read: z.boolean().default(true) }), req.body);
    const updated = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { read } });
    if (!updated.count) throw new ApiError(404, 'not_found', 'That notification is not yours.');
    res.json({ ok: true, patch: await snapshotPatch(['notifications']) });
  }),
);

router.post(
  '/notifications/read-all',
  requireAuth,
  route(async (req, res) => {
    await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
    res.json({ ok: true, patch: await snapshotPatch(['notifications']) });
  }),
);

router.delete(
  '/notifications/:id',
  requireAuth,
  route(async (req, res) => {
    const deleted = await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted.count) throw new ApiError(404, 'not_found', 'That notification is not yours.');
    res.json({ ok: true, patch: await snapshotPatch(['notifications']) });
  }),
);

router.get(
  '/activity',
  requireAuth,
  route(async (req, res) => {
    const limit = Math.min(50, Number(req.query.limit ?? 20) || 20);
    const rows = await prisma.activityEvent.findMany({ orderBy: { at: 'desc' }, take: limit });
    res.json({ ok: true, items: rows.map(serializeActivity) });
  }),
);

// ------------------------------------------------------------------ repositories

router.get(
  '/repositories',
  requireAuth,
  route(async (req, res) => {
    const rows = await prisma.repository.findMany({ where: { userId: req.user.id }, orderBy: [{ isPinned: 'desc' }, { pushedAt: 'desc' }] });
    res.json({ ok: true, items: rows.map(serializeRepository) });
  }),
);

router.post(
  '/repositories/:id/pin',
  requireAuth,
  route(async (req, res) => {
    const { pinned } = parse(z.object({ pinned: z.boolean() }), req.body);
    const updated = await prisma.repository.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isPinned: pinned },
    });
    if (!updated.count) throw new ApiError(404, 'not_found', 'That repository is not on your profile.');
    res.json({ ok: true, patch: await snapshotPatch(['repositories']) });
  }),
);

// ------------------------------------------------------------------ projects

const ProjectInput = z.object({
  id: z.string().max(64).optional(),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().max(1200).default(''),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  url: z.string().url().max(300).optional().or(z.literal('')),
  repoUrl: z.string().url().max(300).optional().or(z.literal('')),
  period: z.string().trim().max(40).optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

router.post(
  '/projects',
  requireAuth,
  route(async (req, res) => {
    const input = parse(ProjectInput, req.body);
    const data = {
      title: input.title,
      summary: input.summary,
      tags: input.tags,
      url: input.url || null,
      repoUrl: input.repoUrl || null,
      period: input.period || null,
      featured: input.featured,
    };

    const project = input.id
      ? await prisma.project.update({ where: { id: input.id, userId: req.user.id }, data })
      : await prisma.project.create({ data: { id: publicId('proj'), userId: req.user.id, ...data } });

    res.status(201).json({ ok: true, project: serializeProject(project), patch: await snapshotPatch(['projects']) });
  }),
);

router.delete(
  '/projects/:id',
  requireAuth,
  route(async (req, res) => {
    const deleted = await prisma.project.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted.count) throw new ApiError(404, 'not_found', 'That project is not on your profile.');
    res.json({ ok: true, patch: await snapshotPatch(['projects']) });
  }),
);

// ------------------------------------------------------------------ GitHub

const GitHubUsername = z.string().trim().regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, 'That does not look like a GitHub username.');

async function gitHubFetch(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DevConnect',
  };
  if (config.GITHUB_API_TOKEN) headers.Authorization = `Bearer ${config.GITHUB_API_TOKEN}`;

  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (response.status === 404) throw new ApiError(404, 'github_not_found', 'GitHub has no profile with that username.');
  if (response.status === 403 || response.status === 429) {
    throw new ApiError(424, 'github_rate_limited', 'GitHub refused the request (rate limit). Set GITHUB_API_TOKEN in server/.env.');
  }
  if (!response.ok) throw new ApiError(502, 'github_unavailable', `GitHub returned ${response.status}.`);
  return response.json();
}

/**
 * Consent-based import of *public* metadata only.
 *
 * The browser never sees a provider token: the username is posted here, GitHub is called
 * server-side, and the resulting rows are written under the authenticated user. Private
 * repository access is out of scope, so `type: public` is the only scope requested.
 */
router.post(
  '/github/connect',
  requireAuth,
  route(async (req, res) => {
    const { username } = parse(z.object({ username: GitHubUsername }), req.body);
    const [profile, repos] = await Promise.all([
      gitHubFetch(`/users/${encodeURIComponent(username)}`),
      gitHubFetch(`/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=30`),
    ]);

    const imported = (Array.isArray(repos) ? repos : [])
      .filter((repo) => repo && !repo.fork)
      .slice(0, 12)
      .map((repo) => ({
        id: `gh-${repo.id}`,
        name: repo.name,
        description: repo.description ?? '',
        language: repo.language ?? '',
        topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 8) : [],
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        watchers: repo.subscribers_count ?? repo.watchers_count ?? 0,
        pushedAt: new Date(repo.pushed_at ?? Date.now()),
        url: repo.html_url,
        openIssues: repo.open_issues_count ?? 0,
        license: repo.license?.spdx_id ?? null,
        defaultBranch: repo.default_branch ?? null,
        contributions: [],
      }));

    await prisma.$transaction(async (tx) => {
      // Replacing an import clears the previous one, including any repos that disappeared.
      await tx.repository.deleteMany({ where: { userId: req.user.id, id: { startsWith: 'gh-' } } });
      for (const repo of imported) {
        await tx.repository.create({ data: { ...repo, userId: req.user.id, isPinned: false } });
      }
      await tx.user.update({ where: { id: req.user.id }, data: { githubUsername: profile.login ?? username } });
    });

    res.json({
      ok: true,
      profile: {
        username: profile.login ?? username,
        name: profile.name ?? null,
        bio: profile.bio ?? null,
        followers: profile.followers ?? 0,
        publicRepos: profile.public_repos ?? imported.length,
      },
      patch: await snapshotPatch(['repositories', 'users']),
    });
  }),
);

router.delete(
  '/github/connect',
  requireAuth,
  route(async (req, res) => {
    await prisma.$transaction([
      prisma.repository.deleteMany({ where: { userId: req.user.id, id: { startsWith: 'gh-' } } }),
      prisma.user.update({ where: { id: req.user.id }, data: { githubUsername: null } }),
    ]);
    res.json({ ok: true, patch: await snapshotPatch(['repositories', 'users']) });
  }),
);

export default router;
