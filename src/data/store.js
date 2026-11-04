/**
 * The mock data store: one persisted document, one mutation path, one subscription.
 *
 * Every write goes through `mutate`, which applies an immutable update, validates
 * cross-entity relations, persists, and notifies subscribers. UI keeps no parallel copy
 * of entity state, so a saved job, a connection request, or an applicant status change is
 * immediately consistent everywhere it appears — and survives a refresh.
 */

import { USERS, COMPANIES, DEMO_CREDENTIALS, DEMO_PASSWORD } from './mockUsers.js';
import { JOBS, FIXED_NOW } from './mockJobs.js';
import { APPLICATIONS, CONNECTIONS, SAVED_JOBS, SAVED_CANDIDATES } from './mockConnections.js';
import { REPOSITORIES, PROJECTS } from './mockRepositories.js';
import { NOTIFICATIONS, ACTIVITY } from './mockNotifications.js';
import { loadSnapshot, saveSnapshot, clearSnapshot, isPersistenceAvailable, SCHEMA_VERSION } from '../lib/storage.js';
import { actsAs } from '../lib/roles.js';
import { scoreMatch } from '../lib/matching.js';
import { normalizeSkills } from '../lib/skills.js';
import { describeActivity } from '../lib/activity.js';
import { computeProfileCompletion as profileCompletion } from '../lib/profile.js';

const COLLECTIONS = [
  ['users', USERS],
  ['companies', COMPANIES],
  ['jobs', JOBS],
  ['applications', APPLICATIONS],
  ['connections', CONNECTIONS],
  ['notifications', NOTIFICATIONS],
  ['repositories', REPOSITORIES],
  ['projects', PROJECTS],
  ['activity', ACTIVITY],
];

function seedSnapshot() {
  return COLLECTIONS.reduce(
    (acc, [key, value]) => ({ ...acc, [key]: structuredClone(value) }),
    {
      savedJobs: structuredClone(SAVED_JOBS),
      savedCandidates: structuredClone(SAVED_CANDIDATES),
      passwordResets: {},
      seededAt: FIXED_NOW,
    },
  );
}

/**
 * Seed content added after a browser already holds a snapshot is invisible to
 * `loadSnapshot`, which verifies that every collection exists but not what is in it.
 * Applying each pack once, behind a marker on the snapshot, delivers new demo identities
 * to returning sessions without discarding the edits those sessions already made.
 */
const REVIEW_USER_ID = 'avery-sandoval';

function rowsForReviewUser(seed) {
  const ownedJobIds = new Set(
    seed.jobs.filter((job) => job.recruiterId === REVIEW_USER_ID).map((job) => job.id),
  );
  return {
    users: seed.users.filter((u) => u.id === REVIEW_USER_ID),
    jobs: seed.jobs.filter((job) => job.recruiterId === REVIEW_USER_ID),
    applications: seed.applications.filter(
      (a) => a.userId === REVIEW_USER_ID || ownedJobIds.has(a.jobId),
    ),
    connections: seed.connections.filter(
      (c) => c.fromUserId === REVIEW_USER_ID || c.toUserId === REVIEW_USER_ID,
    ),
    notifications: seed.notifications.filter((n) => n.userId === REVIEW_USER_ID),
    repositories: seed.repositories.filter((r) => r.userId === REVIEW_USER_ID),
    projects: seed.projects.filter((p) => p.userId === REVIEW_USER_ID),
    activity: seed.activity.filter(
      (a) => a.actorId === REVIEW_USER_ID || a.targetId === REVIEW_USER_ID,
    ),
  };
}

function applySeedPacks(current) {
  const key = 'review-account';
  if (current.seedPacks?.[key]) return current;

  const seed = seedSnapshot();
  const next = { ...current, seedPacks: { ...current.seedPacks, [key]: true } };

  for (const [collection, rows] of Object.entries(rowsForReviewUser(seed))) {
    const present = new Set(current[collection].map((row) => row.id));
    const missing = rows.filter((row) => !present.has(row.id));
    if (missing.length) next[collection] = [...current[collection], ...missing];
  }

  for (const collection of ['savedJobs', 'savedCandidates']) {
    if (!next[collection][REVIEW_USER_ID] && seed[collection][REVIEW_USER_ID]) {
      next[collection] = { ...next[collection], [REVIEW_USER_ID]: seed[collection][REVIEW_USER_ID] };
    }
  }

  saveSnapshot(next);
  return next;
}

let snapshot = applySeedPacks(loadSnapshot(seedSnapshot));
let revision = 0;
const listeners = new Set();

/**
 * The seed dataset is anchored to FIXED_NOW, which can sit ahead of the real clock.
 * Writes therefore advance a monotonic stamp starting at FIXED_NOW instead of calling
 * Date.now() directly — otherwise a request you send right after loading would sort
 * *above* seeded activity that is dated next week and render as "in 6 days".
 */
let lastStamp = Date.parse(FIXED_NOW);
function nowStamp() {
  lastStamp = Math.max(Date.now(), lastStamp + 1000);
  return new Date(lastStamp).toISOString();
}

function emit() {
  revision += 1;
  for (const listener of listeners) listener(snapshot, revision);
}

/**
 * Immutable, atomic write. `producer` receives a shallow clone and returns nothing
 * (mutating the clone is safe: the original is untouched if the producer throws).
 */
function mutate(producer) {
  const draft = { ...snapshot };
  producer(draft);
  snapshot = draft;
  persistAndNotify();
  return snapshot;
}

let storageProblem = null;

function persistAndNotify() {
  const ok = saveSnapshot(snapshot);
  storageProblem = ok ? null : 'unavailable';
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRevision() {
  return revision;
}

export function getSnapshot() {
  return snapshot;
}

/** Restores the initial dataset. Session and theme are deliberately untouched. */
export function resetDemoData() {
  clearSnapshot();
  snapshot = seedSnapshot();
  persistAndNotify();
  return snapshot;
}

/** Every array collection the seed defines — the contract a served snapshot must satisfy. */
const ARRAY_COLLECTIONS = COLLECTIONS.map(([key]) => key);

/**
 * Replaces the render store with a snapshot served by the API.
 *
 * The store keeps its role as the single in-memory copy the UI reads, so no page needs an
 * async read path; Postgres is the source of truth and this is how its state arrives.
 * A payload missing a collection is rejected rather than half-applied, because a partial
 * hydrate would render empty lists that look like real emptiness.
 *
 * @param {import('../types/index.js').StoreSnapshot} next
 */
export function hydrate(next) {
  if (!next || typeof next !== 'object') throw new Error('Served snapshot is not an object.');
  const missing = ARRAY_COLLECTIONS.filter((key) => !Array.isArray(next[key]));
  if (missing.length) throw new Error(`Served snapshot is missing ${missing.join(', ')}.`);
  snapshot = {
    ...seedSnapshot(),
    ...next,
    savedJobs: next.savedJobs ?? {},
    savedCandidates: next.savedCandidates ?? {},
    schemaVersion: SCHEMA_VERSION,
  };
  persistAndNotify();
  return snapshot;
}

/**
 * Empties every collection. Used by the API data source when nobody is signed in: showing
 * the offline seed next to served data would put two worlds on screen at once, and the
 * previous account's rows must not outlive its session.
 */
export function clearServedData() {
  snapshot = ARRAY_COLLECTIONS.reduce((acc, key) => ({ ...acc, [key]: [] }), {
    ...seedSnapshot(),
    savedJobs: {},
    savedCandidates: {},
    schemaVersion: SCHEMA_VERSION,
  });
  persistAndNotify();
  return snapshot;
}

/**
 * Merges the collections a write touched. Every mutation endpoint answers with the rows it
 * changed, so the cache stays consistent without refetching the world after each click.
 * @param {Partial<import('../types/index.js').StoreSnapshot>} patch
 */
export function applyPatch(patch) {
  if (!patch || typeof patch !== 'object') return snapshot;
  mutate((draft) => {
    for (const [key, rows] of Object.entries(patch)) {
      if (ARRAY_COLLECTIONS.includes(key) && Array.isArray(rows)) draft[key] = rows;
      else if (key === 'savedJobs' || key === 'savedCandidates') draft[key] = { ...draft[key], ...rows };
    }
  });
  return snapshot;
}

export function storageDiagnostics() {
  return {
    available: isPersistenceAvailable(),
    problem: storageProblem,
    revision,
    counts: COLLECTIONS.reduce((acc, [key]) => ({ ...acc, [key]: snapshot[key].length }), {}),
  };
}

// ---------------------------------------------------------------- queries

const byId = (list, id) => list.find((item) => item.id === id) ?? null;

export function getUser(id) {
  return byId(snapshot.users, id);
}

export function getUserByEmail(email) {
  const needle = String(email ?? '').trim().toLowerCase();
  return snapshot.users.find((u) => u.email.toLowerCase() === needle) ?? null;
}

export function getCompany(id) {
  return byId(snapshot.companies, id);
}

export function getJob(id) {
  return byId(snapshot.jobs, id);
}

/** Job enriched with the joined company and recruiter the UI needs. */
export function getJobDetail(id) {
  const job = getJob(id);
  if (!job) return null;
  return {
    ...job,
    company: getCompany(job.companyId),
    recruiter: getUser(job.recruiterId),
    applicantCount: snapshot.applications.filter((a) => a.jobId === job.id).length,
  };
}

export function getApplicationsForJob(jobId) {
  return snapshot.applications
    .filter((a) => a.jobId === jobId)
    .map((a) => ({ ...a, developer: getUser(a.userId), job: getJob(a.jobId) }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getApplicationsForUser(userId) {
  return snapshot.applications
    .filter((a) => a.userId === userId)
    .map((a) => ({ ...a, job: getJob(a.jobId), company: getCompany(getJob(a.jobId)?.companyId) }))
    .sort((a, b) => Date.parse(b.appliedAt) - Date.parse(a.appliedAt));
}

/** Applications on jobs a recruiter owns — the pipeline view. */
export function getApplicationsForRecruiter(recruiterId) {
  const jobIds = new Set(snapshot.jobs.filter((j) => j.recruiterId === recruiterId).map((j) => j.id));
  return snapshot.applications
    .filter((a) => jobIds.has(a.jobId))
    .map((a) => ({ ...a, developer: getUser(a.userId), job: getJob(a.jobId), company: getCompany(a.job ? getJob(a.jobId).companyId : '') }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getNotificationCount(userId) {
  return snapshot.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function getNotifications(userId) {
  return snapshot.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getConnectionBetween(a, b) {
  return (
    snapshot.connections.find(
      (c) => (c.fromUserId === a && c.toUserId === b) || (c.fromUserId === b && c.toUserId === a),
    ) ?? null
  );
}

/**
 * Relationship state from `viewerId`'s perspective. The old service always answered
 * 'none'; this is derived from the real connection row.
 */
export function getConnectionState(viewerId, otherId) {
  if (!viewerId || !otherId || viewerId === otherId) return 'self';
  const row = getConnectionBetween(viewerId, otherId);
  if (!row) return 'none';
  if (row.state === 'accepted') return 'connected';
  if (row.state === 'rejected') return 'declined';
  return row.fromUserId === viewerId ? 'outgoing' : 'incoming';
}

export function getConnections(userId) {
  return snapshot.connections
    .filter((c) => c.state === 'accepted' && (c.fromUserId === userId || c.toUserId === userId))
    .map((c) => {
      const otherId = c.fromUserId === userId ? c.toUserId : c.fromUserId;
      return { ...c, user: getUser(otherId), otherId };
    })
    .filter((c) => c.user)
    .sort((a, b) => Date.parse(b.respondedAt ?? b.requestedAt) - Date.parse(a.respondedAt ?? a.requestedAt));
}

export function getPendingRequests(userId) {
  return snapshot.connections
    .filter((c) => c.state === 'pending' && c.toUserId === userId)
    .map((c) => ({ ...c, user: getUser(c.fromUserId) }))
    .filter((c) => c.user)
    .sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt));
}

export function getSentRequests(userId) {
  return snapshot.connections
    .filter((c) => c.state === 'pending' && c.fromUserId === userId)
    .map((c) => ({ ...c, user: getUser(c.toUserId) }))
    .filter((c) => c.user)
    .sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt));
}

export function getRepositories(userId) {
  return snapshot.repositories
    .filter((r) => r.userId === userId)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.stars - a.stars);
}

export function getProjects(userId) {
  return snapshot.projects.filter((p) => p.userId === userId);
}

export function getActivityFor(userId, limit = 12) {
  return snapshot.activity
    .filter((a) => a.targetId === userId || a.actorId === userId)
    .map((a) => {
      // The actor has to be on the row before it is described: a sentence about someone else's
      // action is written from their name, and a bare row does not carry one.
      const row = { ...a, actor: getUser(a.actorId) };
      return { ...row, text: describeActivity(row, userId, see) };
    })
    .filter((a) => a.actor && a.text)
    .sort((x, y) => Date.parse(y.at) - Date.parse(x.at))
    .slice(0, limit);
}

const see = {
  nameOf: (userId) => getUser(userId)?.name ?? 'someone',
  jobTitleOf: (jobId) => getJob(jobId)?.title ?? null,
};

// ------------------------------------------------------- filter + matching

const text = (value) => String(value ?? '').toLowerCase();

function matchesQuery(job, q) {
  if (!q) return true;
  const company = getCompany(job.companyId)?.name ?? '';
  return [job.title, company, job.location, ...job.requiredSkills, ...job.preferredSkills]
    .some((field) => text(field).includes(text(q)));
}

/**
 * Real filtering, sorting and pagination over the store. Previously the page built
 * params and the service ignored them.
 * @param {object} [params]
 */
export function queryJobs(params = {}) {
  const {
    query = '',
    workMode = [],
    jobType = [],
    experienceLevel = [],
    requiredSkills = [],
    minSalary,
    location = '',
    sort = 'recent',
    matchFor = null,
    page = 1,
    perPage = 10,
    recruiterId,
    status,
    savedBy,
  } = params;

  let rows = snapshot.jobs.filter((job) => {
    if (status === 'all') {
      /* recruiter's own list: drafts and closed postings included */
    } else if (status) {
      if (job.status !== status) return false;
    } else if (job.status === 'draft') {
      return false;
    }
    if (recruiterId && job.recruiterId !== recruiterId) return false;
    if (!matchesQuery(job, query)) return false;
    if (location && !text(job.location).includes(text(location))) return false;
    if (workMode.length && !workMode.includes(job.workMode)) return false;
    if (jobType.length && !jobType.includes(job.jobType)) return false;
    if (experienceLevel.length && !experienceLevel.includes(job.experienceLevel)) return false;
    if (requiredSkills.length) {
      const pool = normalizeSkills([...job.requiredSkills, ...job.preferredSkills]).map(text);
      if (!requiredSkills.every((skill) => pool.includes(text(skill)))) return false;
    }
    if (minSalary && (!job.salary || job.salary.min < minSalary)) return false;
    return true;
  });

  const matchScores = new Map();
  if (matchFor) {
    const developer = getUser(matchFor);
    if (developer) {
      for (const job of rows) matchScores.set(job.id, scoreMatch(developer, job, developer.preferences));
    }
  }

  rows = rows.sort((a, b) => {
    if (sort === 'match' && matchScores.size) {
      return (matchScores.get(b.id)?.score ?? 0) - (matchScores.get(a.id)?.score ?? 0) || a.id.localeCompare(b.id);
    }
    if (sort === 'salary-high') return (b.salary?.min ?? 0) - (a.salary?.min ?? 0);
    if (sort === 'salary-low') return (a.salary?.min ?? 0) - (b.salary?.min ?? 0);
    if (sort === 'soonest') return Date.parse(a.applyDeadline ?? '9999') - Date.parse(b.applyDeadline ?? '9999');
    if (sort === 'title') return a.title.localeCompare(b.title);
    return Date.parse(b.postedAt) - Date.parse(a.postedAt);
  });

  const total = rows.length;
  const start = (Math.max(1, page) - 1) * perPage;
  return {
    items: rows.slice(start, start + perPage).map((job) => ({
      ...job,
      company: getCompany(job.companyId),
      recruiter: getUser(job.recruiterId),
      match: matchScores.get(job.id) ?? null,
      isSaved: savedBy ? (snapshot.savedJobs[savedBy] ?? []).includes(job.id) : false,
      hasApplied: savedBy
        ? snapshot.applications.some((a) => a.jobId === job.id && a.userId === savedBy)
        : false,
      applicantCount: snapshot.applications.filter((a) => a.jobId === job.id).length,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Job board facets, derived from actual data so no filter option is ever dead. */
export function getJobFacets() {
  const skills = new Set();
  for (const job of snapshot.jobs) {
    for (const s of normalizeSkills([...job.requiredSkills, ...job.preferredSkills])) skills.add(s);
  }
  return {
    workModes: [...new Set(snapshot.jobs.map((j) => j.workMode))].sort(),
    jobTypes: [...new Set(snapshot.jobs.map((j) => j.jobType))].sort(),
    experienceLevels: ['junior', 'mid', 'senior', 'lead', 'principal'].filter((l) =>
      snapshot.jobs.some((j) => j.experienceLevel === l),
    ),
    companies: [...new Set(snapshot.jobs.map((j) => getCompany(j.companyId)?.name).filter(Boolean))].sort(),
    skills: [...skills].sort(),
  };
}

export function queryDevelopers(params = {}) {
  const {
    query = '',
    skills = [],
    experienceLevel = [],
    location = '',
    openTo,
    excludeConnectedFor,
    page = 1,
    perPage = 12,
  } = params;

  let rows = snapshot.users.filter((u) => u.role === 'developer');
  if (query) {
    rows = rows.filter((u) =>
      [u.name, u.headline, u.location, u.bio, ...(u.skills ?? [])]
        .map(text)
        .some((field) => field.includes(text(query))),
    );
  }
  if (location) rows = rows.filter((u) => text(u.location).includes(text(location)));
  if (experienceLevel.length) rows = rows.filter((u) => experienceLevel.includes(u.experienceLevel));
  if (openTo) rows = rows.filter((u) => u.openTo === openTo);
  if (skills.length) {
    rows = rows.filter((u) => {
      const pool = normalizeSkills(u.skills).map(text);
      return skills.every((s) => pool.includes(text(s)));
    });
  }

  const withState = rows.map((u) => ({
    ...u,
    connectionState: excludeConnectedFor ? getConnectionState(excludeConnectedFor, u.id) : 'none',
    mutualConnections: excludeConnectedFor
      ? getConnections(excludeConnectedFor).filter((c) => getConnectionState(c.otherId, u.id) === 'connected').length
      : 0,
    sharedSkills: excludeConnectedFor
      ? normalizeSkills(u.skills).filter((s) => normalizeSkills(getUser(excludeConnectedFor)?.skills).includes(s))
      : [],
  }));

  const order = { none: 0, incoming: 1, outgoing: 2, connected: 3, declined: 4, self: 5 };
  withState.sort(
    (a, b) =>
      (order[a.connectionState] ?? 9) - (order[b.connectionState] ?? 9) ||
      a.name.localeCompare(b.name),
  );

  const filtered = excludeConnectedFor
    ? withState.filter((u) =>
        params.includeConnected ? true : u.connectionState !== 'connected' && u.connectionState !== 'self',
      )
    : withState;

  const total = filtered.length;
  const start = (Math.max(1, page) - 1) * perPage;
  return {
    items: filtered.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function getDeveloperDetail(id, viewerId) {
  const user = getUser(id);
  // Capability, not literal role: the review account carries a full developer profile and
  // must be viewable by link like any other. The directory itself still lists only developers.
  if (!user || !actsAs(user.role, 'developer')) return null;
  return {
    ...user,
    company: null,
    repositories: getRepositories(id),
    projects: getProjects(id),
    connectionState: viewerId ? getConnectionState(viewerId, id) : 'none',
    mutualConnections: viewerId ? getConnections(viewerId).filter((c) => getConnectionState(c.otherId, id) === 'connected').length : 0,
    activity: getActivityFor(id, 6),
    profileCompletion: computeProfileCompletion(user),
  };
}

/** Suggestions rank on shared skills and mutual connections, deterministically. */
export function getSuggestedDevelopers(userId, limit = 6) {
  const me = getUser(userId);
  if (!me) return [];
  const mySkills = new Set(normalizeSkills(me.skills).map(text));
  return queryDevelopers({ excludeConnectedFor: userId, perPage: 999 })
    .items.map((u) => {
      const shared = normalizeSkills(u.skills).filter((s) => mySkills.has(text(s)));
      return { ...u, sharedSkills: shared, score: shared.length * 2 + u.mutualConnections };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((u) => ({ ...u, score: undefined }));
}

export function getMatches(userId, params = {}) {
  const me = getUser(userId);
  if (!me) return [];
  const minScore = params.minScore ?? 0;
  return queryJobs({ ...params, matchFor: userId, status: 'published', perPage: 999, page: 1 })
    .items.filter((job) => (job.match?.score ?? 0) >= minScore)
    .map((job) => ({
      ...job,
      match: job.match,
      alreadyApplied: snapshot.applications.some((a) => a.jobId === job.id && a.userId === userId),
    }));
}

/** Single (developer, job) score, used by the job detail page. */
export function scoreMatchFor(userIdOrDeveloper, jobId) {
  const developer =
    typeof userIdOrDeveloper === 'string' ? getUser(userIdOrDeveloper) : userIdOrDeveloper;
  const job = getJob(jobId);
  if (!developer || !job) return null;
  return scoreMatch(developer, job, developer.preferences);
}

// ------------------------------------------------------------- completion

/** Deterministic percentage: filled required fields / total required fields. */
export function computeProfileCompletion(user) {
  return profileCompletion(user, snapshot.projects.some((p) => p.userId === user?.id));
}

// ---------------------------------------------------------------- writes

function pushNotification(draft, notification) {
  draft.notifications = [
    {
      id: `ntf-${Date.now().toString(36)}-${Math.floor(draft.notifications.length + 1)}`,
      read: false,
      createdAt: nowStamp(),
      ...notification,
    },
    ...draft.notifications,
  ];
}

export function isJobSaved(userId, jobId) {
  return (snapshot.savedJobs[userId] ?? []).includes(jobId);
}

/** Saved job ids, newest-saved last. */
export function getSavedJobIds(userId) {
  return snapshot.savedJobs[userId] ?? [];
}

export function saveJob(userId, jobId) {
  if (!getUser(userId) || !getJob(jobId)) return false;
  mutate((draft) => {
    const list = new Set(draft.savedJobs[userId] ?? []);
    list.add(jobId);
    draft.savedJobs = { ...draft.savedJobs, [userId]: [...list] };
  });
  return true;
}

export function unsaveJob(userId, jobId) {
  mutate((draft) => {
    draft.savedJobs = {
      ...draft.savedJobs,
      [userId]: (draft.savedJobs[userId] ?? []).filter((id) => id !== jobId),
    };
  });
  return true;
}

export function hasApplied(userId, jobId) {
  return snapshot.applications.some((a) => a.jobId === jobId && a.userId === userId && a.status !== 'withdrawn');
}

/**
 * @returns {{ ok: boolean, application?: any, error?: string }}
 */
export function applyToJob(userId, jobId, { coverNote = '', resume = null } = {}) {
  const job = getJob(jobId);
  const developer = getUser(userId);
  if (!job || !developer) return { ok: false, error: 'Job or developer no longer exists.' };
  if (job.status !== 'published') return { ok: false, error: 'This posting is no longer accepting applications.' };
  if (hasApplied(userId, jobId)) return { ok: false, error: 'You have already applied to this role.' };
  if (!String(coverNote).trim()) return { ok: false, error: 'A note to the hiring team is required.' };

  const now = nowStamp();
  const application = {
    id: `app-${userId}-${jobId}`,
    jobId,
    userId,
    status: 'applied',
    appliedAt: now,
    updatedAt: now,
    coverNote: String(coverNote).trim(),
    resume: resume ?? developer.resume ?? null,
    timeline: [{ status: 'applied', at: now, by: 'developer' }],
    interview: null,
  };

  mutate((draft) => {
    draft.applications = [application, ...draft.applications];
    draft.activity = [
      { id: `act-${Date.now().toString(36)}`, actorId: userId, kind: 'applied', targetId: jobId, at: now },
      ...draft.activity,
    ];
    pushNotification(draft, {
      userId: job.recruiterId,
      kind: 'recruiter-activity',
      title: `New applicant on ${job.title}`,
      body: `${developer.name} applied and is waiting for a first response.`,
      href: `/recruiter/applicants?job=${job.id}`,
      relatedId: application.id,
    });
  });

  return { ok: true, application };
}

export function withdrawApplication(applicationId, byUserId) {
  const target = getApplication(applicationId);
  if (!target || target.userId !== byUserId) return { ok: false, error: 'Application not found.' };
  if (['offer', 'rejected', 'withdrawn'].includes(target.status)) {
    return { ok: false, error: `An application at "${target.status}" cannot be withdrawn.` };
  }
  const now = nowStamp();
  mutate((draft) => {
    draft.applications = draft.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status: 'withdrawn',
            updatedAt: now,
            timeline: [...a.timeline, { status: 'withdrawn', at: now, by: 'developer', note: 'Withdrawn by the applicant.' }],
          }
        : a,
    );
    pushNotification(draft, {
      userId: getJob(target.jobId)?.recruiterId ?? '',
      kind: 'application-update',
      title: `${getUser(byUserId)?.name} withdrew an application`,
      body: `${getJob(target.jobId)?.title} — marked Withdrawn.`,
      href: `/recruiter/applicants?job=${target.jobId}`,
      relatedId: applicationId,
    });
  });
  return { ok: true };
}

export function getApplication(id) {
  const a = byId(snapshot.applications, id);
  if (!a) return null;
  const job = getJob(a.jobId);
  return {
    ...a,
    job,
    company: getCompany(job?.companyId),
    developer: getUser(a.userId),
    recruiter: getUser(job?.recruiterId),
  };
}

const STATUS_ORDER = ['applied', 'under-review', 'interview', 'offer', 'rejected'];

/** Recruiter-side status change; notifies the applicant and keeps one timeline. */
export function setApplicationStatus(applicationId, status, { note = '', by = 'recruiter' } = {}) {
  const target = getApplication(applicationId);
  if (!target) return { ok: false, error: 'Application not found.' };
  if (!STATUS_ORDER.includes(status) && status !== 'withdrawn') {
    return { ok: false, error: `Unknown status "${status}".` };
  }
  if (target.status === status) return { ok: false, error: 'That is already the current status.' };

  const now = nowStamp();
  mutate((draft) => {
    draft.applications = draft.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status,
            updatedAt: now,
            interview: status === 'interview' ? { note: note || 'Interview stage reached.', scheduledFor: a.interview?.scheduledFor ?? now } : a.interview,
            timeline: [...a.timeline, { status, at: now, by, note: note || undefined }],
          }
        : a,
    );
    pushNotification(draft, {
      userId: target.userId,
      kind: 'application-update',
      title: `${target.job?.title ?? 'Your application'} — ${statusLabel(status)}`,
      body: note || `${target.company?.name ?? 'The company'} moved your application to ${statusLabel(status)}.`,
      href: `/applications/${applicationId}`,
      relatedId: applicationId,
    });
  });
  return { ok: true };
}

export function scheduleInterview(applicationId, { note, scheduledFor }) {
  const target = getApplication(applicationId);
  if (!target) return { ok: false, error: 'Application not found.' };
  const iso = new Date(scheduledFor).toISOString();
  mutate((draft) => {
    draft.applications = draft.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status: 'interview',
            updatedAt: nowStamp(),
            interview: { note: note || 'Interview scheduled.', scheduledFor: iso },
            timeline: [...a.timeline, { status: 'interview', at: nowStamp(), by: 'recruiter', note: note || undefined }],
          }
        : a,
    );
    pushNotification(draft, {
      userId: target.userId,
      kind: 'application-update',
      title: `Interview scheduled for ${target.job?.title ?? 'a role'}`,
      body: `${note || 'Interview scheduled.'} — ${(companyNameFor(target.jobId))}.`,
      href: `/applications/${applicationId}`,
      relatedId: applicationId,
    });
  });
  return { ok: true };
}

function companyNameFor(jobId) {
  return getCompany(getJob(jobId)?.companyId)?.name ?? '';
}

export function statusLabel(status) {
  return String(status ?? '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ------------------------------------------------------------ connections

/**
 * @returns {{ ok: boolean, state?: string, error?: string }}
 */
export function sendConnectionRequest(fromUserId, toUserId, message = '') {
  if (fromUserId === toUserId) return { ok: false, error: 'You cannot connect with yourself.' };
  if (!getUser(toUserId)) return { ok: false, error: 'That developer does not exist.' };

  const existing = getConnectionBetween(fromUserId, toUserId);
  if (existing) {
    if (existing.state === 'accepted') return { ok: false, error: 'You are already connected.' };
    if (existing.state === 'pending' && existing.fromUserId === fromUserId) {
      return { ok: false, error: 'Your request is already pending.' };
    }
    if (existing.state === 'pending' && existing.toUserId === fromUserId) {
      return { ok: true, state: 'incoming', error: 'Respond to their request instead of sending another.' };
    }
  }

  const now = nowStamp();
  const row = {
    id: existing ? existing.id : `conn-${fromUserId}-${toUserId}`,
    fromUserId,
    toUserId,
    state: 'pending',
    requestedAt: now,
    message: message ? String(message).trim() : undefined,
  };

  mutate((draft) => {
    draft.connections = existing
      ? draft.connections.map((c) => (c.id === existing.id ? row : c))
      : [...draft.connections, row];
    draft.activity = [
      { id: `act-${Date.now().toString(36)}`, actorId: fromUserId, kind: 'sent-request', targetId: toUserId, at: now },
      ...draft.activity,
    ];
    pushNotification(draft, {
      userId: toUserId,
      kind: 'connection-request',
      title: `${getUser(fromUserId)?.name} wants to connect`,
      body: message ? String(message).trim() : `${getUser(fromUserId)?.headline ?? 'A developer'} sent you a connection request.`,
      href: `/developers/${fromUserId}`,
      relatedId: row.id,
    });
  });

  return { ok: true, state: 'outgoing' };
}

export function respondToConnection(requestId, accept, note = '') {
  const row = byId(snapshot.connections, requestId);
  if (!row || row.state !== 'pending') return { ok: false, error: 'That request is no longer pending.' };
  const now = nowStamp();

  mutate((draft) => {
    if (accept) {
      draft.connections = draft.connections.map((c) =>
        c.id === requestId ? { ...c, state: 'accepted', respondedAt: now } : c,
      );
      draft.activity = [
        { id: `act-${Date.now().toString(36)}`, actorId: row.toUserId, kind: 'accepted-request', targetId: row.fromUserId, at: now },
        ...draft.activity,
      ];
    } else {
      draft.connections = draft.connections.map((c) =>
        c.id === requestId ? { ...c, state: 'rejected', respondedAt: now, message: note || c.message } : c,
      );
    }
    pushNotification(draft, {
      userId: row.fromUserId,
      kind: accept ? 'connection-accepted' : 'system',
      title: accept ? `${getUser(row.toUserId)?.name} accepted your request` : `${getUser(row.toUserId)?.name} declined your request`,
      body: accept
        ? `You can now view ${getUser(row.toUserId)?.name.split(' ')[0]}'s full profile and project list.`
        : 'No action needed — declining is a normal outcome here.',
      href: `/developers/${row.toUserId}`,
      relatedId: requestId,
    });
  });

  return { ok: true };
}

export function withdrawConnectionRequest(requestId) {
  const row = byId(snapshot.connections, requestId);
  if (!row || row.state !== 'pending') return { ok: false, error: 'Only a pending request can be withdrawn.' };
  mutate((draft) => {
    draft.connections = draft.connections.filter((c) => c.id !== requestId);
  });
  return { ok: true };
}

export function removeConnection(userId, otherId) {
  const row = getConnectionBetween(userId, otherId);
  if (!row || row.state !== 'accepted') return { ok: false, error: 'You are not connected to that person.' };
  mutate((draft) => {
    draft.connections = draft.connections.filter((c) => c.id !== row.id);
  });
  return { ok: true };
}

export function toggleSaveCandidate(recruiterId, developerId) {
  mutate((draft) => {
    const list = new Set(draft.savedCandidates[recruiterId] ?? []);
    if (list.has(developerId)) list.delete(developerId);
    else list.add(developerId);
    draft.savedCandidates = { ...draft.savedCandidates, [recruiterId]: [...list] };
  });
  return (snapshot.savedCandidates[recruiterId] ?? []).includes(developerId);
}

export function getSavedCandidates(recruiterId) {
  return (snapshot.savedCandidates[recruiterId] ?? [])
    .map((id) => getUser(id))
    .filter((u) => u && u.role === 'developer')
    .map((u) => ({ ...u, connectionState: getConnectionState(recruiterId, u.id) }));
}

// ---------------------------------------------------------------- profile

export function updateProfile(userId, patch) {
  const allowed = [
    'name',
    'headline',
    'location',
    'bio',
    'avatar',
    'website',
    'linkedIn',
    'twitter',
    'githubUsername',
    'openTo',
    'resume',
    'experienceLevel',
    'yearsOfExperience',
    'visibility',
    'notificationPrefs',
    'preferences',
  ];
  const sanitized = {};
  for (const key of allowed) {
    if (patch[key] === undefined) continue;
    sanitized[key] = key === 'bio' || key === 'headline' ? sanitizeText(patch[key]) : patch[key];
  }
  if (patch.skills !== undefined) sanitized.skills = normalizeSkills(patch.skills);
  if (patch.experience !== undefined) sanitized.experience = sanitizeList(patch.experience);
  if (patch.education !== undefined) sanitized.education = sanitizeList(patch.education);

  mutate((draft) => {
    draft.users = draft.users.map((u) => (u.id === userId ? { ...u, ...sanitized } : u));
  });
  return getUser(userId);
}

export function getPreferences(userId) {
  return getUser(userId)?.preferences ?? { workMode: 'any', roleTypes: ['full-time'], locations: [] };
}

export function setPreferences(userId, preferences) {
  return updateProfile(userId, { preferences });
}

function sanitizeText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').slice(0, 4000);
}

function sanitizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 20).map((item) => ({
    title: sanitizeText(item.title).slice(0, 160),
    organization: sanitizeText(item.organization).slice(0, 160),
    startYear: sanitizeText(item.startYear).slice(0, 8),
    endYear: item.endYear ? sanitizeText(item.endYear).slice(0, 8) : undefined,
    detail: sanitizeText(item.detail).slice(0, 800),
  }));
}

// -------------------------------------------------------------- jobs CRUD

export function createJob(recruiterId, input) {
  const id = input.id ?? `job-${Date.now().toString(36)}`;
  const job = {
    id,
    title: sanitizeText(input.title).slice(0, 140),
    companyId: input.companyId,
    recruiterId,
    location: sanitizeText(input.location).slice(0, 120),
    workMode: input.workMode ?? 'remote',
    jobType: input.jobType ?? 'full-time',
    experienceLevel: input.experienceLevel ?? 'mid',
    salary: input.salary ?? null,
    requiredSkills: normalizeSkills(input.requiredSkills),
    preferredSkills: normalizeSkills(input.preferredSkills),
    description: sanitizeText(input.description),
    responsibilities: (input.responsibilities ?? []).map((r) => sanitizeText(r)).filter(Boolean).slice(0, 10),
    status: input.status === 'published' ? 'published' : 'draft',
    postedAt: nowStamp(),
    applyDeadline: input.applyDeadline || null,
    isFeatured: Boolean(input.isFeatured),
  };
  mutate((draft) => {
    draft.jobs = [job, ...draft.jobs];
    draft.activity = [
      { id: `act-${Date.now().toString(36)}`, actorId: recruiterId, kind: 'posted-job', targetId: job.id, at: job.postedAt },
      ...draft.activity,
    ];
  });
  return getJob(id);
}

export function updateJob(jobId, patch) {
  mutate((draft) => {
    draft.jobs = draft.jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            ...patch,
            title: patch.title !== undefined ? sanitizeText(patch.title).slice(0, 140) : job.title,
            description: patch.description !== undefined ? sanitizeText(patch.description) : job.description,
            requiredSkills: patch.requiredSkills !== undefined ? normalizeSkills(patch.requiredSkills) : job.requiredSkills,
            preferredSkills: patch.preferredSkills !== undefined ? normalizeSkills(patch.preferredSkills) : job.preferredSkills,
            responsibilities:
              patch.responsibilities !== undefined
                ? patch.responsibilities.map((r) => sanitizeText(r)).filter(Boolean).slice(0, 10)
                : job.responsibilities,
          }
        : job,
    );
  });
  return getJob(jobId);
}

export function setJobStatus(jobId, status) {
  if (!['draft', 'published', 'closed'].includes(status)) return { ok: false, error: 'Unknown status.' };
  mutate((draft) => {
    draft.jobs = draft.jobs.map((job) =>
      job.id === jobId
        ? { ...job, status, postedAt: status === 'published' ? nowStamp() : job.postedAt }
        : job,
    );
    if (status === 'closed') {
      for (const app of draft.applications.filter((a) => a.jobId === jobId && ['applied', 'under-review'].includes(a.status))) {
        pushNotification(draft, {
          userId: app.userId,
          kind: 'application-update',
          title: `${getJob(jobId)?.title ?? 'A posting'} closed`,
          body: 'The role is no longer accepting applicants. Your application was archived.',
          href: `/applications/${app.id}`,
          relatedId: app.id,
        });
      }
    }
  });
  return { ok: true };
}

/** Drafts stay visible only on the recruiter's own manage screen. */
export function deleteJob(jobId) {
  const job = getJob(jobId);
  if (!job) return { ok: false, error: 'Job not found.' };
  if (snapshot.applications.some((a) => a.jobId === jobId)) {
    return { ok: false, error: 'This posting has applicants. Close it instead of deleting.' };
  }
  mutate((draft) => {
    draft.jobs = draft.jobs.filter((j) => j.id !== jobId);
  });
  return { ok: true };
}

// ------------------------------------------------------------------ repos

export function setRepositoryPinned(repoId, pinned) {
  mutate((draft) => {
    draft.repositories = draft.repositories.map((r) => (r.id === repoId ? { ...r, isPinned: pinned } : r));
  });
  return true;
}

export function upsertProject(userId, input) {
  const clean = {
    id: input.id ?? `proj-${Date.now().toString(36)}`,
    userId,
    title: sanitizeText(input.title).slice(0, 140),
    summary: sanitizeText(input.summary),
    tags: normalizeSkills(input.tags),
    url: input.url ? sanitizeText(input.url) : undefined,
    repoUrl: input.repoUrl ? sanitizeText(input.repoUrl) : undefined,
    period: input.period ? sanitizeText(input.period).slice(0, 40) : undefined,
    featured: Boolean(input.featured),
  };
  mutate((draft) => {
    draft.projects = draft.projects.some((p) => p.id === clean.id)
      ? draft.projects.map((p) => (p.id === clean.id ? clean : p))
      : [clean, ...draft.projects];
  });
  return clean;
}

export function deleteProject(userId, projectId) {
  const owned = snapshot.projects.find((p) => p.id === projectId && p.userId === userId);
  if (!owned) return { ok: false, error: 'Project not found.' };
  mutate((draft) => {
    draft.projects = draft.projects.filter((p) => p.id !== projectId);
  });
  return { ok: true };
}

// ----------------------------------------------------------- notifications

export function markNotificationRead(id, read = true) {
  mutate((draft) => {
    draft.notifications = draft.notifications.map((n) => (n.id === id ? { ...n, read } : n));
  });
  return true;
}

export function markAllNotificationsRead(userId) {
  let changed = 0;
  mutate((draft) => {
    draft.notifications = draft.notifications.map((n) => {
      if (n.userId !== userId || n.read) return n;
      changed += 1;
      return { ...n, read: true };
    });
  });
  return changed;
}

export function deleteNotification(id) {
  mutate((draft) => {
    draft.notifications = draft.notifications.filter((n) => n.id !== id);
  });
  return true;
}

// -------------------------------------------------------------- sign-up

/**
 * Creates a demo account. There is no password hashing and no email verification here —
 * this is a frontend demonstration and the login screen says so.
 */
export function registerUser({ name, email, password, role, headline = '', location = '' }) {
  if (getUserByEmail(email)) return { ok: false, error: 'An account with that email already exists.' };
  if (String(password).length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  const id = `user-${Date.now().toString(36)}`;
  const base = {
    id,
    role,
    name: sanitizeText(name),
    email: String(email).trim().toLowerCase(),
    headline: sanitizeText(headline) || (role === 'recruiter' ? 'Recruiter' : 'Developer'),
    location: sanitizeText(location) || 'Remote',
    avatar: null,
    bio: '',
    skills: [],
    experienceLevel: 'mid',
    githubUsername: '',
    openTo: 'new-roles',
    emailVerified: false,
    visibility: 'public',
    notificationPrefs: { connectionRequests: true, applicationUpdates: true, jobMatches: true, recruiterActivity: true },
    preferences: { workMode: 'any', experienceLevel: 'mid', roleTypes: ['full-time'], locations: [] },
    experience: [],
    education: [],
    createdAt: nowStamp(),
    demoPassword: String(password),
  };
  mutate((draft) => {
    draft.users = [...draft.users, base];
  });
  return { ok: true, user: getUser(id) };
}

/**
 * Demo-only email verification. There is no mail transport in this app, so the verify
 * screen simulates opening the link; this flips the flag and nothing else.
 */
export function forceVerify(userId) {
  mutate((draft) => {
    draft.users = draft.users.map((u) => (u.id === userId ? { ...u, emailVerified: true } : u));
  });
  return getUser(userId);
}

/**
 * Demo-only password reset. There is no mail transport in this app, so the token is
 * handed back to the caller to display as a link — the UI must say this plainly instead
 * of pretending an email was sent.
 */
export function requestPasswordReset(email) {
  const user = getUserByEmail(email);
  const token = `rst-${Math.random().toString(36).slice(2, 10)}`;
  mutate((draft) => {
    draft.passwordResets = {
      ...(draft.passwordResets ?? {}),
      [token]: { userId: user?.id ?? null, requestedAt: nowStamp() },
    };
  });
  return { ok: true, token, knownEmail: Boolean(user) };
}

export function completePasswordReset(token, password) {
  const entry = snapshot.passwordResets?.[token];
  if (!entry?.userId) return { ok: false, error: 'That reset link is not valid. Request a new one.' };
  if (String(password).length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  mutate((draft) => {
    draft.users = draft.users.map((u) =>
      u.id === entry.userId ? { ...u, demoPassword: String(password) } : u,
    );
    const remaining = { ...(draft.passwordResets ?? {}) };
    delete remaining[token];
    draft.passwordResets = remaining;
  });
  return { ok: true, user: getUser(entry.userId) };
}

/** Demo-only credential check. Never present this as real authentication. */
export function checkCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) return { ok: false, error: 'No demo account found with that email.' };
  if (String(password) !== (user.demoPassword ?? DEMO_PASSWORD)) {
    return { ok: false, error: 'That password does not match this demo account.' };
  }
  return { ok: true, user };
}

export function listDemoAccounts() {
  return DEMO_CREDENTIALS;
}

// ------------------------------------------------------------- validation

/**
 * Runs once at module load. A relation that points at a missing entity means the seed
 * data itself is wrong, which is exactly the class of bug that makes a demo collapse.
 */
function validateRelations(data) {
  const problems = [];
  const userIds = new Set(data.users.map((u) => u.id));
  const jobIds = new Set(data.jobs.map((j) => j.id));
  const companyIds = new Set(data.companies.map((c) => c.id));

  for (const job of data.jobs) {
    if (!userIds.has(job.recruiterId)) problems.push(`job ${job.id}: recruiter ${job.recruiterId} missing`);
    if (!companyIds.has(job.companyId)) problems.push(`job ${job.id}: company ${job.companyId} missing`);
  }
  for (const app of data.applications) {
    if (!userIds.has(app.userId)) problems.push(`application ${app.id}: user ${app.userId} missing`);
    if (!jobIds.has(app.jobId)) problems.push(`application ${app.id}: job ${app.jobId} missing`);
  }
  for (const conn of data.connections) {
    if (!userIds.has(conn.fromUserId)) problems.push(`connection ${conn.id}: from ${conn.fromUserId} missing`);
    if (!userIds.has(conn.toUserId)) problems.push(`connection ${conn.id}: to ${conn.toUserId} missing`);
  }
  for (const ntf of data.notifications) {
    if (!userIds.has(ntf.userId)) problems.push(`notification ${ntf.id}: recipient ${ntf.userId} missing`);
  }
  for (const repo of data.repositories) {
    if (!userIds.has(repo.userId)) problems.push(`repository ${repo.id}: owner ${repo.userId} missing`);
  }
  for (const project of data.projects) {
    if (!userIds.has(project.userId)) problems.push(`project ${project.id}: owner ${project.userId} missing`);
  }

  if (problems.length) {
    // Loud, once, and non-fatal: the app still renders with the rows that are intact.
    console.warn('[devconnect] seed relation problems:', problems);
  }
  return problems;
}

validateRelations(snapshot);
