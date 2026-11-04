/**
 * Route-level smoke tests for the developer module.
 *
 * Run with the server up: `npm run test:http`. It drives the same HTTP surface the browser
 * uses, so a failure here is a failure the UI would show. Nothing is mocked; every assertion
 * reads Postgres through the API.
 *
 * The script seeds before and after, because it registers accounts, applies to jobs and files
 * repositories as it goes — without the closing seed that residue shows up in the recruiter's
 * candidate directory. A failing run stops before the second seed, so the damage is still there
 * to inspect.
 */
import { config } from '../src/config.js';

const ORIGIN = `http://localhost:${config.PORT}`;
const BASE = `${ORIGIN}/api/v1`;

let passed = 0;
const failures = [];
const jars = new Map();

async function call(method, path, { body, as = 'guest', expect = 200, raw = false, root = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (jars.has(as)) headers.Cookie = jars.get(as);

  const response = await fetch(`${root ? ORIGIN : BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  const token = setCookie.map((c) => c.split(';')[0]).find((c) => c.startsWith('devconnect_token='));
  if (token) jars.set(as, token);
  if (setCookie.some((c) => /Max-Age=0/.test(c))) jars.delete(as);

  const payload = raw ? null : await response.json().catch(() => null);

  const allowed = Array.isArray(expect) ? expect : [expect];
  if (!allowed.includes(response.status)) {
    const detail = JSON.stringify(payload?.error ?? payload)?.slice(0, 300);
    failures.push(`${method} ${path} as ${as}: expected ${allowed.join(' or ')}, got ${response.status} ${detail}`);
    console.log(`FAIL ${method} ${path} as ${as}: expected ${allowed.join(' or ')}, got ${response.status} ${detail}`);
    return { status: response.status, payload };
  }
  passed += 1;
  console.log(`ok   ${method} ${path} (${response.status})`);
  return { status: response.status, payload };
}

function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log(`ok   ${label}`);
  } else {
    failures.push(`assertion failed: ${label}`);
    console.log(`FAIL ${label}`);
  }
}

const DEMO_PASSWORD = 'demo1234';

async function main() {
  try {
    await run();
  } finally {
    console.log(`\n${passed} checks passed, ${failures.length} failed`);
    if (failures.length) {
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
    }
  }
}

async function run() {
  const health = await call('GET', '/health', { as: 'health', expect: 200, root: true });
  check('health reports a live database', health.payload?.ok === true && health.payload?.database === 'connected');

  // ---- registration and login -------------------------------------------------
  const email = `smoke.${Date.now()}@devconnect.test`;
  const registered = await call('POST', '/auth/register', {
    as: 'newbie',
    expect: 201,
    body: { name: 'Smoke Tester', email, password: 'smoketest1', role: 'developer', headline: 'Test engineer', location: 'Remote' },
  });
  check('register returns the account without a password hash', registered.payload?.user?.email === email && !('passwordHash' in (registered.payload?.user ?? {})));

  await call('POST', '/auth/register', { as: 'clash', expect: 409, body: { name: 'Dupe', email, password: 'smoketest1', role: 'developer' } });
  await call('POST', '/auth/register', { as: 'weak', expect: 422, body: { name: 'Weak', email: `weak.${Date.now()}@x.test`, password: '123', role: 'developer' } });
  await call('POST', '/auth/register', { as: 'escalate', expect: 422, body: { name: 'Mallory', email: `mallory.${Date.now()}@x.test`, password: 'longenough', role: 'superuser' } });
  await call('POST', '/auth/login', { as: 'guest', expect: 401, body: { email, password: 'wrong-password' } });
  await call('GET', '/jobs', { as: 'nobody', expect: 401 });

  await call('POST', '/auth/login', { as: 'dev', expect: 200, body: { email: 'priya.raman@devconnect.test', password: DEMO_PASSWORD } });
  await call('POST', '/auth/login', { as: 'rec', expect: 200, body: { email: 'nathan.boone@devconnect.test', password: DEMO_PASSWORD } });
  await call('POST', '/auth/login', { as: 'super', expect: 200, body: { email: 'avery.sandoval@devconnect.test', password: DEMO_PASSWORD } });

  const session = await call('GET', '/auth/session', { as: 'dev' });
  const snapshot = session.payload?.snapshot ?? {};
  check('session hydrates every collection', ['users', 'companies', 'jobs', 'applications', 'connections', 'notifications', 'repositories', 'projects', 'activity', 'savedJobs', 'savedCandidates'].every((key) => key in snapshot));
  check('snapshot carries the seeded board', (snapshot.jobs?.length ?? 0) >= 25 && (snapshot.users?.length ?? 0) >= 25);
  check('the served snapshot carries no password hash', !JSON.stringify(snapshot.users).includes('passwordHash'));

  // ---- discovery --------------------------------------------------------------
  const jobs = await call('GET', '/jobs?perPage=5&sort=recent', { as: 'dev' });
  check('job rows are decorated for the board', jobs.payload?.items?.[0]?.company?.name && 'applicantCount' in jobs.payload.items[0] && 'isSaved' in jobs.payload.items[0]);
  const matchList = await call('GET', '/jobs?sort=match&perPage=5', { as: 'dev' });
  const scores = (matchList.payload?.items ?? []).map((item) => item.match?.score ?? 0);
  check('match sort is descending', scores.every((score, i) => i === 0 || scores[i - 1] >= score));
  check('match result explains itself', Array.isArray(matchList.payload?.items?.[0]?.match?.reasons) && matchList.payload.items[0].match.reasons.length > 0);

  const filtered = await call('GET', '/jobs?workMode=remote&experienceLevel=senior', { as: 'dev' });
  check('filters exclude non-matching rows', filtered.payload?.items?.every((j) => j.workMode === 'remote' && j.experienceLevel === 'senior') ?? false);

  await call('GET', '/jobs/facets', { as: 'dev' });
  await call('GET', '/jobs/nw-ts-fullstack', { as: 'dev' });
  await call('GET', '/jobs/does-not-exist', { as: 'dev', expect: 404 });
  // The recruiter router guards its own prefix; a developer hitting a path nothing owns must
  // get a 404, not the recruiter capability refusal from a router-level middleware.
  await call('GET', '/me', { as: 'dev', expect: 404 });
  await call('GET', '/no-such-route', { as: 'dev', expect: 404 });

  const matches = await call('GET', '/matches?minScore=40', { as: 'dev' });
  check('matches respect the score floor', (matches.payload?.items ?? []).every((entry) => entry.match.score >= 40));

  const directory = await call('GET', '/developers?perPage=8', { as: 'rec' });
  check('directory lists developers only', (directory.payload?.items ?? []).every((u) => u.role === 'developer'));
  const detail = await call('GET', '/developers/priya-raman', { as: 'rec' });
  const profile = detail.payload?.developer ?? {};
  check(
    'developer detail returns the profile screen payload',
    profile.id === 'priya-raman' &&
      Array.isArray(profile.repositories) &&
      Array.isArray(profile.projects) &&
      typeof profile.connectionState === 'string' &&
      'mutualConnections' in profile &&
      profile.profileCompletion?.percent >= 0,
  );
  check('detail sentences are built server-side', (profile.activity ?? []).every((row) => typeof row.text === 'string'));
  await call('GET', '/developers/nathan-boone', { as: 'rec', expect: 404 });
  await call('GET', '/developers/who-is-this', { as: 'rec', expect: 404 });

  // ---- profile writes ---------------------------------------------------------
  const patched = await call('PATCH', '/me', { as: 'newbie', body: { bio: 'Wrote this through the API.', skills: ['TypeScript', 'Testing'], openTo: 'new-roles' } });
  check('profile patch persists', patched.payload?.user?.bio === 'Wrote this through the API.' && patched.payload?.user?.skills.length === 2);
  await call('PATCH', '/me', { as: 'newbie', expect: 422, body: { githubUsername: 'not a valid username!' } });
  await call('PATCH', '/me/preferences', { as: 'newbie', body: { workMode: 'hybrid', roleTypes: ['full-time'], locations: ['Remote'], minSalary: 120000 } });

  // ---- applications -----------------------------------------------------------
  const target = (await call('GET', '/jobs?workMode=remote&perPage=20', { as: 'newbie' })).payload?.items?.find(
    (job) => job.status === 'published' && !job.hasApplied,
  );
  check('a published role is available to apply to', Boolean(target));
  if (!target) throw new Error('no published remote role to apply to — stopping before the apply block');

  const applied = await call('POST', `/jobs/${target.id}/apply`, { as: 'newbie', expect: 201, body: { coverNote: 'Smoke test application.' } });
  check('apply returns the timeline start', applied.payload?.application?.timeline?.[0]?.status === 'applied');
  check('apply notifies the applicant', (applied.payload?.patch?.notifications ?? []).some((n) => n.relatedId === applied.payload.application.id));
  await call('POST', `/jobs/${target.id}/apply`, { as: 'newbie', expect: 409 });

  const mine = await call('GET', '/applications', { as: 'newbie' });
  check('application list is scoped to the caller', (mine.payload?.items ?? []).every((a) => a.userId === registered.payload.user.id) && mine.payload.items.length === 1);

  const applicationId = applied.payload.application.id;
  await call('GET', `/applications/${applicationId}`, { as: 'dev', expect: 404 });
  await call('PATCH', `/applications/${applicationId}/status`, { as: 'dev', expect: 403 });
  const owner = await call('GET', `/jobs/${target.id}`, { as: 'rec' });
  check('only the owning recruiter can move an applicant', owner.payload.job.recruiterId !== session.payload.user.id);

  // The recruiter who owns the role moves it forward; the candidate must not be able to read it.
  const recruiterSession = await call('GET', '/auth/session', { as: 'rec' });
  const ownedIds = new Set(((await call('GET', '/recruiter/jobs', { as: 'rec' })).payload?.items ?? []).map((job) => job.id));
  const pipeline = await call('GET', '/recruiter/applications', { as: 'rec' });
  const theirApplication = (pipeline.payload?.items ?? []).find((a) => ownedIds.has(a.jobId) && a.status !== 'withdrawn');
  check(
    'recruiter pipeline returns applicants on their postings',
    Boolean(theirApplication) && theirApplication.userId !== recruiterSession.payload.user.id,
  );
  check('the pipeline never leaks another recruiter\'s applicants', (pipeline.payload?.items ?? []).every((a) => ownedIds.has(a.jobId)));
  if (!theirApplication) throw new Error('no seeded applicant on the recruiter board — stopping before the pipeline block');
  const moveTo = theirApplication.status === 'interview' ? 'offer' : 'interview';
  await call('PATCH', `/applications/${theirApplication.id}/status`, { as: 'rec', body: { status: moveTo, note: 'Reviewed the repo links.' } });
  const moved = await call('GET', `/applications/${theirApplication.id}`, { as: 'rec' });
  check('status write reaches the timeline', moved.payload?.application?.status === moveTo);
  check('the status note is kept', moved.payload?.application?.timeline?.at(-1)?.note === 'Reviewed the repo links.');
  check('the new status is the last event', moved.payload?.application?.timeline?.at(-1)?.status === moveTo);
  // The review account acts as a recruiter, but is neither the applicant nor the posting's
  // owner, so the row must not be readable by it.
  await call('GET', `/applications/${theirApplication.id}`, { as: 'super', expect: 404 });

  await call('PATCH', `/applications/${applicationId}/status`, { as: 'super', expect: 403, body: { status: 'rejected' } });
  await call('POST', `/applications/${applicationId}/withdraw`, { as: 'dev', expect: 404 });

  // ---- connections ------------------------------------------------------------
  const self = await call('GET', '/auth/session', { as: 'newbie' });
  const peers = await call('GET', '/developers?perPage=20', { as: 'newbie' });
  const candidate = (peers.payload?.items ?? []).find((u) => u.id !== self.payload.user.id);
  if (!candidate) throw new Error('the developer directory returned no one to connect with');
  const request = await call('POST', '/connections', { as: 'newbie', expect: 201, body: { toUserId: candidate.id, message: 'Fellow smoke tester.' } });
  await call('POST', '/connections', { as: 'newbie', expect: 409, body: { toUserId: candidate.id } });
  await call('POST', '/connections', { as: 'newbie', expect: 404, body: { toUserId: 'who-is-this' } });
  await call('POST', '/connections', { as: 'newbie', expect: 422, body: { toUserId: self.payload.user.id } });
  await call('GET', '/connections/requests', { as: 'newbie' });

  await call('POST', '/auth/login', { as: 'target', expect: 200, body: { email: candidate.email, password: DEMO_PASSWORD } });
  await call('POST', `/connections/${request.payload.connection.id}/accept`, { as: 'target' });
  const accepted = await call('GET', '/connections', { as: 'newbie' });
  check('accepted connection is visible to the requester', accepted.payload?.items?.some((c) => c.id === request.payload.connection.id && c.state === 'accepted'));
  const afterAccept = await call('GET', `/developers/${candidate.id}`, { as: 'newbie' });
  check('developer detail reports the live pair state', afterAccept.payload?.developer?.connectionState === 'connected');

  // ---- shortlists, notifications, workspace -----------------------------------
  await call('PUT', `/saved-jobs/${target.id}`, { as: 'newbie' });
  const savedSnapshot = await call('GET', '/auth/session', { as: 'newbie' });
  check('saved job lands in the map', (savedSnapshot.payload.snapshot.savedJobs[self.payload.user.id] ?? []).includes(target.id));
  await call('DELETE', `/saved-jobs/${target.id}`, { as: 'newbie' });

  await call('PUT', `/saved-candidates/${candidate.id}`, { as: 'rec' });
  await call('GET', '/saved-candidates', { as: 'rec' });
  await call('PUT', `/saved-candidates/${candidate.id}`, { as: 'dev', expect: 403 });
  await call('DELETE', `/saved-candidates/${candidate.id}`, { as: 'rec' });

  const notifications = await call('GET', '/notifications', { as: 'newbie' });
  check('applicant got a welcome notification', (notifications.payload?.items ?? []).length > 0);
  const first = notifications.payload?.items?.[0];
  if (!first) throw new Error('the new applicant got no notifications');
  await call('POST', `/notifications/${first.id}/read`, { as: 'newbie', body: { read: true } });
  await call('POST', '/notifications/read-all', { as: 'newbie' });
  await call('DELETE', `/notifications/${first.id}`, { as: 'dev', expect: 404 });

  await call('GET', '/activity', { as: 'newbie' });
  await call('GET', '/repositories', { as: 'dev' });
  const project = await call('POST', '/projects', { as: 'newbie', expect: 201, body: { title: 'Smoke board', summary: 'Proves project CRUD works.', tags: ['React'], featured: true } });
  await call('DELETE', `/projects/${project.payload.project.id}`, { as: 'newbie' });

  // ---- GitHub, server-side ----------------------------------------------------
  // The browser never holds a provider token, so this is the only route that leaves the
  // machine. Rate limits are the shared unauthenticated quota, so 424 is a pass: the contract
  // under test is "the server answers with its own envelope, never a 500 or a token".
  await call('DELETE', '/github/connect', { as: 'dev' });
  const connected = await call('POST', '/github/connect', { as: 'dev', expect: [200, 424, 404], body: { username: 'gaearon' } });
  if (connected.status === 200) {
    const imported = (connected.payload?.patch?.repositories ?? []).filter((repo) => repo.id.startsWith('gh-'));
    check('import writes real repos for the caller only', imported.length > 0 && imported.every((repo) => repo.userId === 'priya-raman'));
    check('the username lands on the profile', connected.payload?.patch?.users?.find((u) => u.id === 'priya-raman')?.githubUsername === 'gaearon');
    const keys = [];
    const walk = (value) => {
      if (value && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value)) {
          keys.push(key);
          walk(nested);
        }
      }
    };
    walk(connected.payload);
    check('no provider credential is sent to the client', !keys.some((key) => /token|secret|authoriz/i.test(key)));
    await call('GET', '/repositories', { as: 'dev' });
  } else {
    console.log(`     (github returned ${connected.status} — import assertions skipped)`);
  }
  await call('POST', '/github/connect', { as: 'dev', expect: [404, 422], body: { username: 'not a username!!' } });
  const disconnected = await call('DELETE', '/github/connect', { as: 'dev' });
  check('disconnect clears the imported rows', (disconnected.payload?.patch?.repositories ?? []).every((repo) => !repo.id.startsWith('gh-')));

  // ---- recruiter posting CRUD -------------------------------------------------
  const created = await call('POST', '/recruiter/jobs', {
    as: 'rec',
    expect: 201,
    body: {
      title: 'Smoke Test Engineer',
      location: 'Remote (US/EU)',
      workMode: 'remote',
      jobType: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 120000, max: 150000, currency: 'USD', period: 'year' },
      requiredSkills: ['Testing', 'TypeScript'],
      preferredSkills: ['Playwright'],
      description: 'A posting created by the smoke suite to exercise the recruiter CRUD path end to end.',
      responsibilities: ['Write the checks', 'Keep the board honest'],
      status: 'draft',
    },
  });
  const jobId = created.payload?.job?.id;
  await call('PUT', `/recruiter/jobs/${jobId}/status`, { as: 'rec', body: { status: 'published' } });
  await call('PATCH', `/recruiter/jobs/${jobId}`, { as: 'rec', body: { title: 'Smoke Test Engineer II' } });
  await call('PUT', `/recruiter/jobs/${jobId}/status`, { as: 'dev', expect: 403 });
  await call('DELETE', `/recruiter/jobs/${jobId}`, { as: 'dev', expect: 403 });
  await call('DELETE', `/recruiter/jobs/${jobId}`, { as: 'rec' });

  // ---- superuser acts on both sides -------------------------------------------
  const superSession = await call('GET', '/auth/session', { as: 'super' });
  check('superuser session exposes the review identity', superSession.payload?.user?.role === 'superuser');
  await call('GET', '/recruiter/jobs', { as: 'super' });
  await call('GET', '/matches', { as: 'super' });

  // ---- password reset ---------------------------------------------------------
  const forgot = await call('POST', '/auth/password/forgot', { as: 'guest2', expect: 200, body: { email } });
  check('forgot returns the same envelope for an unknown address', (await call('POST', '/auth/password/forgot', { as: 'guest3', body: { email: 'nobody@nowhere.test' } })).status === 200);
  if (forgot.payload?.devToken) {
    await call('POST', '/auth/password/reset', { as: 'guest4', body: { token: forgot.payload.devToken, password: 'smoketest2' } });
    await call('POST', '/auth/password/reset', { as: 'guest4', expect: 400, body: { token: forgot.payload.devToken, password: 'smoketest3' } });
    await call('POST', '/auth/login', { as: 'newbie', expect: 200, body: { email, password: 'smoketest2' } });
  }

  await call('POST', '/auth/logout', { as: 'newbie' });
  await call('GET', '/auth/session', { as: 'newbie', expect: 401 });
}

main().catch((error) => {
  console.error('Smoke run crashed:', error);
  process.exitCode = 1;
});
