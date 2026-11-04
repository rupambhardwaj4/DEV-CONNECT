/**
 * Seed notifications and profile activity.
 *
 * Unread/read split is deliberate: the demo account opens the notification centre with
 * something to act on, and mark-all-read has visible effect on first try.
 */

import { FIXED_NOW } from './mockJobs.js';

const at = (daysAgo) => new Date(Date.parse(FIXED_NOW) - daysAgo * 86400000).toISOString();
const ahead = (days) => new Date(Date.parse(FIXED_NOW) + days * 86400000).toISOString();

/** @type {import('../types/index.js').AppNotification[]} */
export const NOTIFICATIONS = [
  // --- Priya Raman (demo developer) ---
  {
    id: 'ntf-priya-interview',
    userId: 'priya-raman',
    kind: 'application-update',
    title: 'Interview scheduled at Northwind Labs',
    body: 'Nathan Boone moved your Senior Full-Stack Engineer application to Interview. 90-minute systems conversation with Nathan and Tobias.',
    href: '/applications/app-priya-nw-ts',
    read: false,
    createdAt: at(2),
    relatedId: 'app-priya-nw-ts',
  },
  {
    id: 'ntf-priya-req-felipe',
    userId: 'priya-raman',
    kind: 'connection-request',
    title: 'Felipe Castro wants to connect',
    body: 'Junior full-stack developer, São Paulo. He mentions the export layer you built at CivicLoop.',
    href: '/developers/felipe-castro',
    read: false,
    createdAt: at(2),
    relatedId: 'conn-felipe-priya',
  },
  {
    id: 'ntf-priya-req-aiko',
    userId: 'priya-raman',
    kind: 'connection-request',
    title: 'Aiko Tanaka wants to connect',
    body: 'Security engineer in Tokyo. "We should compare notes on auth surfaces before your next checkout refactor."',
    href: '/developers/aiko-tanaka',
    read: false,
    createdAt: at(3),
    relatedId: 'conn-aiko-priya',
  },
  {
    id: 'ntf-priya-match',
    userId: 'priya-raman',
    kind: 'recruiter-activity',
    title: 'Hana Oyelaran viewed your profile',
    body: 'Talent Engineer at Brightloom looked at your profile twice this week. Your Design Systems skill is not listed — she may filter on it.',
    href: '/profile/edit',
    read: false,
    createdAt: at(1),
  },
  {
    id: 'ntf-priya-offer',
    userId: 'priya-raman',
    kind: 'application-update',
    title: 'Offer from CivicLoop expires in four days',
    body: 'Full-Stack Engineer (React + Node). The written offer is valid for ten days from 27 October.',
    href: '/applications/app-priya-cl-fullstack',
    read: true,
    createdAt: at(5),
    relatedId: 'app-priya-cl-fullstack',
  },
  {
    id: 'ntf-priya-accepted-ingrid',
    userId: 'priya-raman',
    kind: 'connection-accepted',
    title: 'Nothing to act on',
    body: 'Your request to Sara Bennani is still pending. Two-week-old requests are usually worth a follow-up message instead.',
    href: '/network',
    read: true,
    createdAt: at(9),
  },
  {
    id: 'ntf-priya-rejected',
    userId: 'priya-raman',
    kind: 'application-update',
    title: 'Update on your Atlas Analytics application',
    body: 'Senior Data Engineer (Contract): they went with someone who has run a Spark re-platform before. Recruiter note suggests keeping in touch.',
    href: '/applications/app-priya-aa-sr-data',
    read: true,
    createdAt: at(26),
    relatedId: 'app-priya-aa-sr-data',
  },
  {
    id: 'ntf-priya-system',
    userId: 'priya-raman',
    kind: 'system',
    title: 'Your profile is 82% complete',
    body: 'Missing: resume file, two years of experience detail, and one featured project summary.',
    href: '/profile/edit',
    read: true,
    createdAt: at(7),
  },

  // --- Nathan Boone (demo recruiter) ---
  {
    id: 'ntf-nathan-new-app',
    userId: 'nathan-boone',
    kind: 'recruiter-activity',
    title: 'New applicant on Senior Full-Stack Engineer',
    body: 'Diego Marchant applied three days ago and is still in Under Review. Median time to first action on this req is 31 hours.',
    href: '/recruiter/applicants?job=nw-ts-fullstack',
    read: false,
    createdAt: at(1),
  },
  {
    id: 'ntf-nathan-offer',
    userId: 'nathan-boone',
    kind: 'recruiter-activity',
    title: 'Lukas Brandt has not responded to your offer',
    body: 'Collector (Rust) — verbal offer sent eight days ago. Written package is still unsent.',
    href: '/recruiter/applicants?job=nw-collector-rust',
    read: false,
    createdAt: at(2),
    relatedId: 'app-lukas-nw-collector',
  },
  {
    id: 'ntf-nathan-wei',
    userId: 'nathan-boone',
    kind: 'application-update',
    title: 'Wei Zhang accepted your interview invitation',
    body: 'Collector (Rust) — confirmed the deep-dive with Lukas for the coming week.',
    href: '/recruiter/applicants?job=nw-collector-rust',
    read: false,
    createdAt: at(3),
  },
  {
    id: 'ntf-nathan-draft',
    userId: 'nathan-boone',
    kind: 'system',
    title: 'Two draft postings have not been published',
    body: 'DevOps Engineer and Interview Loop Designer have been sitting as drafts for more than a day.',
    href: '/recruiter/jobs',
    read: false,
    createdAt: at(1),
  },
  {
    id: 'ntf-nathan-priya',
    userId: 'nathan-boone',
    kind: 'application-update',
    title: 'Priya Raman updated her resume',
    body: 'Senior Full-Stack Engineer applicant replaced her resume file after applying.',
    href: '/recruiter/applicants?job=nw-ts-fullstack',
    read: true,
    createdAt: at(4),
    relatedId: 'app-priya-nw-ts',
  },
  {
    id: 'ntf-nathan-weekly',
    userId: 'nathan-boone',
    kind: 'system',
    title: 'Pipeline summary for your three postings',
    body: '11 applicants, 3 interviews, 1 offer, 1 rejection. The query builder req has no applicants yet.',
    href: '/recruiter',
    read: true,
    createdAt: at(6),
  },

  // --- Avery Sandoval (review account) — one inbox that mixes both sides of the product,
  //     because that is what this account actually is. ---
  { id: 'ntf-avery-applied-cl', userId: 'avery-sandoval', kind: 'application-update', title: 'CivicLoop moved you to Interview', body: 'Systems conversation on the filings queue, six days out.', href: '/applications/app-avery-cl-fullstack', read: false, createdAt: at(2), relatedId: 'app-avery-cl-fullstack' },
  { id: 'ntf-avery-offer-diego', userId: 'avery-sandoval', kind: 'recruiter-activity', title: 'Diego Marchant reached offer on your Accessibility role', body: 'Offer extended, valid for ten days. You have not written the counter-offer note yet.', href: '/recruiter/applicants', read: false, createdAt: at(2), relatedId: 'app-diego-mh-access' },
  { id: 'ntf-avery-new-ingrid', userId: 'avery-sandoval', kind: 'applied', title: 'Ingrid Halvorsen applied to Product Engineer, Accessibility', body: 'Self-declared gap on screen-reader internals; strong on contract-tested regressions.', href: '/recruiter/applicants', read: false, createdAt: at(1), relatedId: 'app-ingrid-mh-access' },
  { id: 'ntf-avery-req-aiko', userId: 'avery-sandoval', kind: 'connection-request', title: 'Aiko Tanaka wants to connect', body: 'Security engineer in Tokyo. Wants to argue about one section of the rubric rewrite.', href: '/developers/aiko-tanaka', read: false, createdAt: at(3), relatedId: 'conn-aiko-avery' },
  { id: 'ntf-avery-accepted-tobias', userId: 'avery-sandoval', kind: 'connection-accepted', title: 'Tobias Keller accepted your request', body: 'He also applied to Staff Engineer, Scheduling Core. The loop is now scheduled.', href: '/developers/tobias-keller', read: true, createdAt: at(20), relatedId: 'conn-tobias-avery' },
  { id: 'ntf-avery-summary', userId: 'avery-sandoval', kind: 'system', title: 'Pipeline summary for your two live postings', body: '6 applicants, 1 interview, 1 offer, 1 rejection, 1 withdrawn against a closed role.', href: '/recruiter', read: true, createdAt: at(5) },

  // --- Background, so other accounts are not empty shells ---
  { id: 'ntf-diego-bl', userId: 'diego-marchant', kind: 'application-update', title: 'Brightloom opened a role matching your skills', body: 'Design Systems Engineer lists four skills you have.', href: '/jobs/bl-ds', read: false, createdAt: at(1) },
  { id: 'ntf-elena-req', userId: 'elena-sorensen', kind: 'connection-request', title: 'Clara Mendes wants to connect', body: 'Design engineer, Porto. Same motion-guidelines problem.', href: '/developers/clara-mendes', read: false, createdAt: at(2) },
  { id: 'ntf-sara-req', userId: 'sara-bennani', kind: 'connection-request', title: 'Priya Raman wants to connect', body: 'Senior full-stack engineer, Bengaluru.', href: '/developers/priya-raman', read: false, createdAt: at(4) },
  { id: 'ntf-ingrid-offer', userId: 'ingrid-halvorsen', kind: 'application-update', title: 'Contract terms sent by Atlas Analytics', body: 'Senior Data Engineer, six months.', href: '/applications/app-ingrid-aa-sr-data', read: false, createdAt: at(6) },
  { id: 'ntf-hana-read', userId: 'hanaa-elsayed', kind: 'system', title: 'Your profile appeared in 4 recruiter searches', body: 'Filtered on Python, FastAPI, PostgreSQL.', href: '/settings', read: true, createdAt: at(8) },
];

/** @type {import('../types/index.js').ActivityEvent[]} */
export const ACTIVITY = [
  { id: 'act-1', actorId: 'hana-oyelaran', kind: 'viewed-profile', targetId: 'priya-raman', at: at(1) },
  { id: 'act-2', actorId: 'nathan-boone', kind: 'posted-job', targetId: 'nw-react-query', at: at(1) },
  { id: 'act-3', actorId: 'felipe-castro', kind: 'sent-request', targetId: 'priya-raman', at: at(2) },
  { id: 'act-4', actorId: 'diego-marchant', kind: 'applied', targetId: 'nw-ts-fullstack', at: at(4) },
  { id: 'act-5', actorId: 'julia-nowak', kind: 'accepted-request', targetId: 'priya-raman', at: at(17) },
  { id: 'act-6', actorId: 'sara-bennani', kind: 'starred-repo', targetId: 'repo-priya-querydeck', at: at(5) },
  { id: 'act-7', actorId: 'elena-sorensen', kind: 'viewed-profile', targetId: 'priya-raman', at: at(6) },
  { id: 'act-8', actorId: 'imani-wright', kind: 'posted-job', targetId: 'aa-intern', at: at(2) },
  { id: 'act-9', actorId: 'tobias-keller', kind: 'starred-repo', targetId: 'repo-priya-token-pipe', at: at(9) },
  { id: 'act-10', actorId: 'marcus-adeyemi', kind: 'applied', targetId: 'lc-payments', at: at(1) },
  { id: 'act-11', actorId: 'clara-mendes', kind: 'sent-request', targetId: 'priya-raman', at: at(39) },
  { id: 'act-12', actorId: 'nathan-boone', kind: 'viewed-profile', targetId: 'lukas-brandt', at: at(7) },
  { id: 'act-13', actorId: 'imani-wright', kind: 'viewed-profile', targetId: 'avery-sandoval', at: at(1) },
  { id: 'act-14', actorId: 'tobias-keller', kind: 'starred-repo', targetId: 'repo-avery-bookings', at: at(3) },
  { id: 'act-15', actorId: 'aiko-tanaka', kind: 'sent-request', targetId: 'avery-sandoval', at: at(3) },
];

/** Interview slots shown as future dates in the demo. */
export const DEMO_FUTURE = ahead;
