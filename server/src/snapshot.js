import { prisma } from './db.js';
import { COLLECTIONS, serializeApplication, serializeActivity, serializeCompany, serializeConnection, serializeJob, serializeNotification, serializeProject, serializeRepository, serializeUser } from './serialize.js';

const SERIALIZERS = {
  users: serializeUser,
  companies: serializeCompany,
  jobs: serializeJob,
  applications: serializeApplication,
  connections: serializeConnection,
  notifications: serializeNotification,
  repositories: serializeRepository,
  projects: serializeProject,
  activity: serializeActivity,
};

const READERS = {
  users: () => prisma.user.findMany({ include: { company: true }, orderBy: [{ role: 'asc' }, { name: 'asc' }] }),
  companies: () => prisma.company.findMany({ orderBy: { name: 'asc' } }),
  jobs: () => prisma.job.findMany({ orderBy: { postedAt: 'desc' } }),
  applications: () => prisma.application.findMany({ include: { events: true }, orderBy: { appliedAt: 'desc' } }),
  connections: () => prisma.connection.findMany({ orderBy: { requestedAt: 'desc' } }),
  notifications: () => prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
  repositories: () => prisma.repository.findMany({ orderBy: [{ isPinned: 'desc' }, { pushedAt: 'desc' }] }),
  projects: () => prisma.project.findMany({ orderBy: [{ featured: 'desc' }, { title: 'asc' }] }),
  activity: () => prisma.activityEvent.findMany({ orderBy: { at: 'desc' } }),
};

async function savedJobsMap() {
  const rows = await prisma.savedJob.findMany({ orderBy: { savedAt: 'desc' } });
  const map = {};
  for (const row of rows) (map[row.userId] ??= []).push(row.jobId);
  return map;
}

async function savedCandidatesMap() {
  const rows = await prisma.savedCandidate.findMany({ orderBy: { savedAt: 'desc' } });
  const map = {};
  for (const row of rows) (map[row.userId] ??= []).push(row.developerId);
  return map;
}

async function readCollection(name) {
  if (name === 'savedJobs') return savedJobsMap();
  if (name === 'savedCandidates') return savedCandidatesMap();
  return (await READERS[name]()).map(SERIALIZERS[name]);
}

/**
 * The whole workspace as one document, matching the client's StoreSnapshot contract.
 *
 * Reads of this dataset are cheap (tens of rows) and the single-document shape is what lets
 * the browser keep a synchronous render store while Postgres stays the source of truth.
 */
export async function loadSnapshot() {
  const entries = await Promise.all(COLLECTIONS.map(async (name) => [name, await readCollection(name)]));
  return Object.fromEntries(entries);
}

/**
 * The collections a write actually touched. Responses carry this so the client patches only
 * what changed instead of refetching the board after every click.
 */
export async function snapshotPatch(touched = []) {
  const names = [...new Set(touched)].filter((name) => COLLECTIONS.includes(name));
  const entries = await Promise.all(names.map(async (name) => [name, await readCollection(name)]));
  return Object.fromEntries(entries);
}
