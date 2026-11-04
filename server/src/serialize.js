/**
 * Row → client contract mapping.
 *
 * The database stores enum values with underscores (Postgres identifiers cannot hold the
 * hyphenated literals the UI uses, e.g. `under-review`). Everything else is already the
 * shape declared in src/types/index.js, so a serialized row can be dropped straight into
 * the client's render store without a translation layer on the other side.
 */

const toLiteral = (value) => (typeof value === 'string' ? value.replace(/_/g, '-') : value);
export const toEnum = (value) => (typeof value === 'string' ? value.replace(/-/g, '_') : value);

const iso = (date) => (date instanceof Date ? date.toISOString() : date ?? null);

const PUBLIC_USER_FIELDS = [
  'id', 'role', 'name', 'email', 'headline', 'location', 'avatar', 'bio', 'skills',
  'experienceLevel', 'yearsOfExperience', 'githubUsername', 'website', 'linkedIn', 'twitter',
  'openTo', 'resume', 'emailVerified', 'visibility', 'notificationPrefs', 'preferences',
  'experience', 'education', 'companyId', 'title', 'createdAt',
];

export function serializeUser(user) {
  const row = {};
  for (const key of PUBLIC_USER_FIELDS) row[key] = user[key] ?? (key === 'skills' ? [] : undefined);
  row.role = toLiteral(user.role);
  row.visibility = toLiteral(user.visibility);
  if (user.experienceLevel) row.experienceLevel = toLiteral(user.experienceLevel);
  row.companyName = user.company?.name ?? null;
  row.createdAt = iso(user.createdAt);
  return row;
}

export function serializeJob(job) {
  return {
    id: job.id,
    title: job.title,
    companyId: job.companyId,
    recruiterId: job.recruiterId,
    location: job.location,
    workMode: toLiteral(job.workMode),
    jobType: toLiteral(job.jobType),
    experienceLevel: toLiteral(job.experienceLevel),
    salary: job.salary ?? null,
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    description: job.description,
    responsibilities: job.responsibilities,
    status: toLiteral(job.status),
    postedAt: iso(job.postedAt),
    applyDeadline: iso(job.applyDeadline),
    isFeatured: job.isFeatured,
  };
}

export function serializeApplication(application) {
  return {
    id: application.id,
    jobId: application.jobId,
    userId: application.userId,
    status: toLiteral(application.status),
    appliedAt: iso(application.appliedAt),
    updatedAt: iso(application.updatedAt),
    coverNote: application.coverNote,
    timeline: (application.events ?? [])
      .slice()
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map((event) => ({
        status: toLiteral(event.status),
        at: iso(event.at),
        by: toLiteral(event.by),
        ...(event.note ? { note: event.note } : {}),
      })),
    interview: application.interview ?? null,
  };
}

export function serializeConnection(connection) {
  return {
    id: connection.id,
    fromUserId: connection.fromUserId,
    toUserId: connection.toUserId,
    state: toLiteral(connection.state),
    requestedAt: iso(connection.requestedAt),
    ...(connection.respondedAt ? { respondedAt: iso(connection.respondedAt) } : {}),
    ...(connection.message ? { message: connection.message } : {}),
  };
}

export function serializeNotification(notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    kind: toLiteral(notification.kind),
    title: notification.title,
    body: notification.body,
    href: notification.href ?? null,
    read: notification.read,
    createdAt: iso(notification.createdAt),
    relatedId: notification.relatedId ?? null,
  };
}

export function serializeRepository(repository) {
  return {
    id: repository.id,
    userId: repository.userId,
    name: repository.name,
    description: repository.description,
    language: repository.language,
    topics: repository.topics,
    stars: repository.stars,
    forks: repository.forks,
    watchers: repository.watchers,
    pushedAt: iso(repository.pushedAt),
    url: repository.url,
    isPinned: repository.isPinned,
    contributions: repository.contributions,
    openIssues: repository.openIssues ?? undefined,
    license: repository.license ?? undefined,
    defaultBranch: repository.defaultBranch ?? undefined,
  };
}

export function serializeProject(project) {
  return {
    id: project.id,
    userId: project.userId,
    title: project.title,
    summary: project.summary,
    tags: project.tags,
    url: project.url ?? undefined,
    repoUrl: project.repoUrl ?? undefined,
    period: project.period ?? undefined,
    featured: project.featured,
  };
}

export function serializeActivity(event) {
  return {
    id: event.id,
    actorId: event.actorId,
    kind: event.kind,
    targetId: event.targetId,
    at: iso(event.at),
  };
}

export function serializeCompany(company) {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    size: company.size,
    location: company.location,
    website: company.website ?? undefined,
    blurb: company.blurb,
    logoText: company.logoText ?? undefined,
  };
}

/** The collections the client's render store holds, in the order the UI expects them. */
export const COLLECTIONS = [
  'users',
  'companies',
  'jobs',
  'applications',
  'connections',
  'notifications',
  'repositories',
  'projects',
  'activity',
  'savedJobs',
  'savedCandidates',
];
