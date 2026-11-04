/**
 * Loads the project's seed dataset into PostgreSQL.
 *
 * The rows come from the same modules the offline demo ships (src/data/mock*), so the API and
 * the browser-only mode describe the identical world — a reviewer can diff one against the
 * other. Re-running replaces the data: it is the reset button the synopsis asks for.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { USERS, COMPANIES, DEMO_PASSWORD } from '../../src/data/mockUsers.js';
import { JOBS } from '../../src/data/mockJobs.js';
import { APPLICATIONS, CONNECTIONS, SAVED_JOBS, SAVED_CANDIDATES } from '../../src/data/mockConnections.js';
import { NOTIFICATIONS, ACTIVITY } from '../../src/data/mockNotifications.js';
import { REPOSITORIES, PROJECTS } from '../../src/data/mockRepositories.js';
import { toEnum } from '../src/serialize.js';

const prisma = new PrismaClient();

const date = (value) => (value ? new Date(value) : null);
const LEVELS = ['junior', 'mid', 'senior', 'lead', 'principal'];

const DEFAULT_PREFS = {
  connectionRequests: true,
  applicationUpdates: true,
  jobMatches: true,
  recruiterActivity: true,
};

async function clear() {
  // Children first; every relation is onDelete: Cascade but explicit order keeps the log readable.
  await prisma.passwordResetToken.deleteMany();
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.savedCandidate.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.project.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

async function seedCompanies() {
  for (const company of COMPANIES) {
    await prisma.company.create({
      data: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        size: company.size,
        location: company.location,
        website: company.website ?? null,
        blurb: company.blurb,
        logoText: company.logoText ?? null,
      },
    });
  }
  return COMPANIES.length;
}

async function seedUsers(passwordHash) {
  for (const user of USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        role: toEnum(user.role),
        name: user.name,
        email: user.email,
        passwordHash,
        headline: user.headline ?? '',
        location: user.location ?? '',
        avatar: user.avatar ?? null,
        bio: user.bio ?? '',
        skills: user.skills ?? [],
        experienceLevel: user.experienceLevel ? toEnum(user.experienceLevel) : null,
        yearsOfExperience: user.yearsOfExperience ?? null,
        githubUsername: user.githubUsername ?? null,
        website: user.website ?? null,
        linkedIn: user.linkedIn ?? null,
        twitter: user.twitter ?? null,
        openTo: user.openTo ?? null,
        resume: user.resume ?? null,
        emailVerified: user.emailVerified ?? true,
        visibility: toEnum(user.visibility ?? 'public'),
        notificationPrefs: user.notificationPrefs ?? DEFAULT_PREFS,
        preferences: user.preferences ?? (user.role === 'recruiter' ? null : { workMode: 'any', roleTypes: [], locations: [], minSalary: null }),
        experience: user.experience ?? [],
        education: user.education ?? [],
        companyId: user.companyId ?? null,
        title: user.title ?? null,
        createdAt: date(user.createdAt) ?? new Date(),
      },
    });
  }
  return USERS.length;
}

async function seedJobs() {
  for (const job of JOBS) {
    await prisma.job.create({
      data: {
        id: job.id,
        title: job.title,
        companyId: job.companyId,
        recruiterId: job.recruiterId,
        location: job.location,
        workMode: toEnum(job.workMode),
        jobType: toEnum(job.jobType),
        experienceLevel: toEnum(job.experienceLevel),
        salary: job.salary ?? undefined,
        requiredSkills: job.requiredSkills ?? [],
        preferredSkills: job.preferredSkills ?? [],
        description: job.description,
        responsibilities: job.responsibilities ?? [],
        status: toEnum(job.status),
        postedAt: date(job.postedAt),
        applyDeadline: date(job.applyDeadline),
        isFeatured: Boolean(job.isFeatured),
      },
    });
  }
  return JOBS.length;
}

async function seedApplications() {
  for (const application of APPLICATIONS) {
    await prisma.application.create({
      data: {
        id: application.id,
        jobId: application.jobId,
        userId: application.userId,
        status: toEnum(application.status),
        appliedAt: date(application.appliedAt),
        updatedAt: date(application.updatedAt) ?? date(application.appliedAt),
        coverNote: application.coverNote ?? '',
        interview: application.interview ?? undefined,
        events: {
          create: (application.timeline ?? []).map((event) => ({
            status: toEnum(event.status),
            at: date(event.at),
            by: toEnum(event.by),
            note: event.note ?? null,
          })),
        },
      },
    });
  }
  return APPLICATIONS.length;
}

async function seedConnections() {
  for (const connection of CONNECTIONS) {
    await prisma.connection.create({
      data: {
        id: connection.id,
        fromUserId: connection.fromUserId,
        toUserId: connection.toUserId,
        state: toEnum(connection.state),
        requestedAt: date(connection.requestedAt),
        respondedAt: date(connection.respondedAt),
        message: connection.message ?? null,
      },
    });
  }
  return CONNECTIONS.length;
}

async function seedSaved() {
  let jobs = 0;
  for (const [userId, ids] of Object.entries(SAVED_JOBS)) {
    for (const jobId of ids) {
      await prisma.savedJob.create({ data: { userId, jobId } });
      jobs += 1;
    }
  }
  let candidates = 0;
  for (const [userId, ids] of Object.entries(SAVED_CANDIDATES)) {
    for (const developerId of ids) {
      await prisma.savedCandidate.create({ data: { userId, developerId } });
      candidates += 1;
    }
  }
  return { jobs, candidates };
}

async function seedNotifications() {
  for (const notification of NOTIFICATIONS) {
    await prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        kind: toEnum(notification.kind),
        title: notification.title,
        body: notification.body ?? '',
        href: notification.href ?? null,
        read: Boolean(notification.read),
        createdAt: date(notification.createdAt),
        relatedId: notification.relatedId ?? null,
      },
    });
  }
  return NOTIFICATIONS.length;
}

async function seedRepositories() {
  for (const repository of REPOSITORIES) {
    await prisma.repository.create({
      data: {
        id: repository.id,
        userId: repository.userId,
        name: repository.name,
        description: repository.description ?? '',
        language: repository.language ?? '',
        topics: repository.topics ?? [],
        stars: repository.stars ?? 0,
        forks: repository.forks ?? 0,
        watchers: repository.watchers ?? 0,
        pushedAt: date(repository.pushedAt),
        url: repository.url,
        isPinned: Boolean(repository.isPinned),
        contributions: repository.contributions ?? [],
        openIssues: repository.openIssues ?? null,
        license: repository.license ?? null,
        defaultBranch: repository.defaultBranch ?? null,
      },
    });
  }
  return REPOSITORIES.length;
}

async function seedProjects() {
  for (const project of PROJECTS) {
    await prisma.project.create({
      data: {
        id: project.id,
        userId: project.userId,
        title: project.title,
        summary: project.summary ?? '',
        tags: project.tags ?? [],
        url: project.url ?? null,
        repoUrl: project.repoUrl ?? null,
        period: project.period ?? null,
        featured: Boolean(project.featured),
      },
    });
  }
  return PROJECTS.length;
}

async function seedActivity() {
  for (const event of ACTIVITY) {
    await prisma.activityEvent.create({
      data: { id: event.id, actorId: event.actorId, kind: event.kind, targetId: event.targetId, at: date(event.at) },
    });
  }
  return ACTIVITY.length;
}

async function main() {
  await clear();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const counts = {
    companies: await seedCompanies(),
    users: await seedUsers(passwordHash),
    jobs: await seedJobs(),
    applications: await seedApplications(),
    connections: await seedConnections(),
    saved: await seedSaved(),
    notifications: await seedNotifications(),
    repositories: await seedRepositories(),
    projects: await seedProjects(),
    activity: await seedActivity(),
  };

  console.log('Seeded devconnect from src/data:', JSON.stringify(counts));
  console.log(`Every seeded account signs in with the demo password: ${DEMO_PASSWORD}`);
  console.log(`Levels kept for the matcher: ${LEVELS.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
