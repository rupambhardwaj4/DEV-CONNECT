/**
 * Data transport facade.
 *
 * The UI never learns which backend it is talking to. Reads come from the render store in both
 * modes — in `api` mode that store is the snapshot Postgres served, kept fresh by the patch each
 * write returns. Writes are the only place the transports differ, so each one declares its local
 * store call and its HTTP counterpart side by side here.
 *
 * `local` is the offline demo: `commit` simulates the round trip so a submit button still shows
 * honest pending state. `api` is the Express + Prisma service under `server/`. Set
 * `VITE_DATA_SOURCE=api` in `.env` to switch; nothing else in the app changes.
 */

import * as store from '../data/store.js';
import { describeError, fetchSession, request, usingApi } from './apiClient.js';

export const LATENCY_MS = 260;

/**
 * Resolve a store write after a short delay, so a double click cannot fire twice while the
 * first one is still landing. Local mode only — a real round trip is its own delay.
 * @template T
 * @param {() => T} write
 * @returns {Promise<T>}
 */
export async function commit(write) {
  const result = write();
  if (LATENCY_MS > 0) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return result;
}

/**
 * Runs one write through the active transport and hands back what the page expects.
 *
 * `remote` is `{ method, path, body }`; `present` maps the API envelope onto the fields the
 * caller reads, because a page checks `result.application` and not the shape of a REST document.
 * Failures come back as `{ ok: false, error }` — the same envelope the store writes return — so
 * no screen has to know which transport refused it.
 */
function write(local, remote, present = () => ({})) {
  if (!usingApi()) return commit(local);
  return execute(remote, present);
}

/**
 * `remote` is a spec or a thunk returning one — a thunk lets a caller derive the verb or the id
 * from the cached snapshot instead of the server guessing. `spec.all` runs several calls in
 * order for the writes the server split across endpoints.
 */
async function execute(remote, present = () => ({}), { reject = false } = {}) {
  try {
    const spec = typeof remote === 'function' ? remote() : remote;
    if (!spec) return { ok: false, error: 'That change has no served endpoint to apply it.' };
    const calls = spec.all ?? [[spec.method, spec.path, spec.body]];
    let payload = null;
    for (const [method, path, body] of calls) payload = await request(method, path, body);
    return { ok: true, ...present(payload) };
  } catch (error) {
    if (reject) throw error;
    return { ok: false, error: describeError(error), code: error.code, details: error.details };
  }
}

/** Like `write`, but a failure throws: the calling screen already wraps the call in try/catch. */
function writeStrict(local, remote, present = () => ({})) {
  if (!usingApi()) return commit(local);
  return execute(remote, present, { reject: true });
}

export const jobs = {
  query: (params) => store.queryJobs(params),
  facets: () => store.getJobFacets(),
  detail: (id) => store.getJobDetail(id),
  save: (userId, jobId) =>
    write(() => store.saveJob(userId, jobId), { method: 'PUT', path: `/saved-jobs/${jobId}` }, () => ({ saved: true })),
  unsave: (userId, jobId) =>
    write(() => store.unsaveJob(userId, jobId), { method: 'DELETE', path: `/saved-jobs/${jobId}` }, () => ({ saved: false })),
  apply: (userId, jobId, payload) =>
    write(
      () => store.applyToJob(userId, jobId, payload),
      { method: 'POST', path: `/jobs/${jobId}/apply`, body: { coverNote: payload.coverNote ?? '' } },
      (document) => ({ application: document.application }),
    ),
  create: (recruiterId, input) =>
    writeStrict(() => store.createJob(recruiterId, input), { method: 'POST', path: '/recruiter/jobs', body: input }, (d) => d.job),
  update: (jobId, patch) =>
    writeStrict(() => store.updateJob(jobId, patch), { method: 'PATCH', path: `/recruiter/jobs/${jobId}`, body: patch }, (d) => d.job),
  setStatus: (jobId, status) =>
    write(
      () => store.setJobStatus(jobId, status),
      { method: 'PUT', path: `/recruiter/jobs/${jobId}/status`, body: { status } },
      (d) => ({ job: d.job }),
    ),
  remove: (jobId) => write(() => store.deleteJob(jobId), { method: 'DELETE', path: `/recruiter/jobs/${jobId}` }),
};

export const applications = {
  forUser: (userId) => store.getApplicationsForUser(userId),
  forJob: (jobId) => store.getApplicationsForJob(jobId),
  forRecruiter: (recruiterId) => store.getApplicationsForRecruiter(recruiterId),
  detail: (id) => store.getApplication(id),
  withdraw: (id, byUserId) =>
    write(() => store.withdrawApplication(id, byUserId), { method: 'POST', path: `/applications/${id}/withdraw` }),
  setStatus: (id, status, meta = {}) =>
    write(
      () => store.setApplicationStatus(id, status, meta),
      { method: 'PATCH', path: `/applications/${id}/status`, body: { status, note: meta.note } },
    ),
  scheduleInterview: (id, meta) =>
    write(
      () => store.scheduleInterview(id, meta),
      { method: 'POST', path: `/applications/${id}/interview`, body: { scheduledFor: meta.scheduledFor, note: meta.note ?? '' } },
    ),
};

export const developers = {
  query: (params) => store.queryDevelopers(params),
  detail: (id, viewerId) => store.getDeveloperDetail(id, viewerId),
  suggestions: (userId, limit) => store.getSuggestedDevelopers(userId, limit),
  /**
   * Profile fields and matcher preferences are two endpoints on the server, one store call
   * offline. The split happens here so the screens can keep sending one object.
   */
  update: (userId, patch) => {
    if (!usingApi()) return commit(() => store.updateProfile(userId, patch));
    const { preferences, ...profile } = patch;
    const calls = [];
    if (Object.keys(profile).length) calls.push(['PATCH', '/me', profile]);
    if (preferences) calls.push(['PATCH', '/me/preferences', preferences]);
    if (!calls.length) return Promise.resolve({ ok: true, user: store.getUser(userId) });
    return execute({ all: calls }, () => ({ user: store.getUser(userId) }));
  },
};

export const connections = {
  list: (userId) => store.getConnections(userId),
  pending: (userId) => store.getPendingRequests(userId),
  sent: (userId) => store.getSentRequests(userId),
  state: (viewerId, otherId) => store.getConnectionState(viewerId, otherId),
  send: (from, to, message) =>
    write(
      () => store.sendConnectionRequest(from, to, message),
      { method: 'POST', path: '/connections', body: { toUserId: to, message } },
      (d) => ({ connection: d.connection }),
    ),
  respond: (requestId, accept, note) =>
    write(
      () => store.respondToConnection(requestId, accept, note),
      { method: 'POST', path: `/connections/${requestId}/${accept ? 'accept' : 'decline'}`, body: { note } },
    ),
  withdrawSent: (requestId) =>
    write(() => store.withdrawConnectionRequest(requestId), { method: 'DELETE', path: `/connections/${requestId}` }),
  /** The page knows the other person, not the row id, so the id is read from the cached pair. */
  remove: (userId, otherId) =>
    write(
      () => store.removeConnection(userId, otherId),
      () => {
        const row = store
          .getSnapshot()
          .connections.find(
            (c) =>
              c.state === 'accepted' &&
              ((c.fromUserId === userId && c.toUserId === otherId) || (c.fromUserId === otherId && c.toUserId === userId)),
          );
        return row ? { method: 'DELETE', path: `/connections/${row.id}` } : null;
      },
    ),
};

export const notifications = {
  list: (userId) => store.getNotifications(userId),
  unreadCount: (userId) => store.getNotificationCount(userId),
  markRead: (id, read) =>
    write(() => store.markNotificationRead(id, read), { method: 'POST', path: `/notifications/${id}/read`, body: { read } }),
  markAllRead: (userId) => write(() => store.markAllNotificationsRead(userId), { method: 'POST', path: '/notifications/read-all' }),
  remove: (id) => write(() => store.deleteNotification(id), { method: 'DELETE', path: `/notifications/${id}` }),
};

/**
 * GitHub integration.
 *
 * `profile`, `repositories` and `isConnected` are derived views over the cached rows, so they
 * read the store in both modes. `connect` is the API-only path: the username goes to the server,
 * the server calls GitHub, and the browser never holds a provider credential.
 */
export const github = {
  isConnected: (userId) => Boolean(store.getUser(userId)?.githubUsername),
  profile: (userId) => {
    const user = store.getUser(userId);
    const repositories = store.getRepositories(userId);
    if (!user?.githubUsername) return null;
    return {
      username: user.githubUsername,
      displayName: user.name,
      url: `https://github.com/${user.githubUsername}`,
      repositoryCount: repositories.length,
      totalStars: repositories.reduce((sum, r) => sum + r.stars, 0),
      totalForks: repositories.reduce((sum, r) => sum + r.forks, 0),
      languages: [...new Set(repositories.map((r) => r.language))],
      repositories,
      contributions: repositories.length
        ? repositories[0].contributions.map((_, day) =>
            repositories.reduce((sum, repo) => sum + (repo.contributions[day] ?? 0), 0),
          )
        : [],
      source: usingApi() ? 'api' : 'mock',
    };
  },
  repositories: (userId) => store.getRepositories(userId),
  setPinned: (repoId, pinned) =>
    write(() => store.setRepositoryPinned(repoId, pinned), { method: 'POST', path: `/repositories/${repoId}/pin`, body: { pinned } }, () => ({
      pinned,
    })),
  connect: (username) =>
    write(
      () => ({ ok: false, error: 'There is no live GitHub import in the offline demo. Run the API and set VITE_DATA_SOURCE=api.' }),
      { method: 'POST', path: '/github/connect', body: { username } },
      (d) => ({ profile: d.profile, repositories: d.patch?.repositories ?? [] }),
    ),
  disconnect: () =>
    write(
      () => ({ ok: false, error: 'Nothing to disconnect in the offline demo.' }),
      { method: 'DELETE', path: '/github/connect' },
    ),
};

export const projects = {
  forUser: (userId) => store.getProjects(userId),
  upsert: (userId, input) =>
    write(() => store.upsertProject(userId, input), { method: 'POST', path: '/projects', body: input }, (d) => ({ project: d.project })),
  remove: (userId, projectId) =>
    write(() => store.deleteProject(userId, projectId), { method: 'DELETE', path: `/projects/${projectId}` }),
};

export const matching = {
  forUser: (userId, params) => store.getMatches(userId, params),
  score: (userId, jobId) => store.scoreMatchFor(userId, jobId),
};

export const recruiter = {
  savedCandidates: (recruiterId) => store.getSavedCandidates(recruiterId),
  /** The store toggles; the API has an explicit save and unsave, so the current cache decides. */
  toggleSaveCandidate: (recruiterId, developerId) => {
    const wasSaved = (store.getSnapshot().savedCandidates[recruiterId] ?? []).includes(developerId);
    return write(
      () => store.toggleSaveCandidate(recruiterId, developerId),
      { method: wasSaved ? 'DELETE' : 'PUT', path: `/saved-candidates/${developerId}` },
      () => ({ saved: !wasSaved }),
    );
  },
  jobPostings: (recruiterId) => store.queryJobs({ recruiterId, status: 'all', perPage: 999, page: 1 }),
  pipeline: (recruiterId) => applications.forRecruiter(recruiterId),
  stats: (recruiterId) => {
    const jobs = store.getSnapshot().jobs.filter((j) => j.recruiterId === recruiterId);
    const apps = store.getApplicationsForRecruiter(recruiterId);
    const byStatus = apps.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), {});
    return {
      postings: jobs.length,
      published: jobs.filter((j) => j.status === 'published').length,
      drafts: jobs.filter((j) => j.status === 'draft').length,
      closed: jobs.filter((j) => j.status === 'closed').length,
      applicants: apps.length,
      byStatus,
      interviewStage: byStatus.interview ?? 0,
      offersOut: byStatus.offer ?? 0,
    };
  },
};

export const activity = {
  forUser: (userId, limit) => store.getActivityFor(userId, limit),
};

export const demo = {
  /** Offline this re-seeds localStorage; served it discards local drift and re-reads Postgres. */
  reset: () =>
    usingApi()
      ? execute({ method: 'GET', path: '/auth/session' })
      : commit(() => {
          store.resetDemoData();
          return { ok: true };
        }),
  diagnostics: () => store.storageDiagnostics(),
  accounts: () => store.listDemoAccounts(),
  users: () => store.getSnapshot().users,
  /** Returns the token so the UI can show the link it would otherwise have mailed. */
  requestPasswordReset: (email) =>
    write(
      () => store.requestPasswordReset(email),
      { method: 'POST', path: '/auth/password/forgot', body: { email } },
      (d) => ({ token: d.devToken ?? null, knownEmail: Boolean(d.devToken), message: d.message }),
    ),
  completePasswordReset: (token, password) =>
    write(
      () => store.completePasswordReset(token, password),
      { method: 'POST', path: '/auth/password/reset', body: { token, password } },
      (d) => ({ user: d.user ?? null }),
    ),
};

export { fetchSession, usingApi };
export { DATA_SOURCE } from './apiClient.js';
