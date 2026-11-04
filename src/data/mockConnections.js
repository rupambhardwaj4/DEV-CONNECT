/**
 * Seed relationship data: applications, connections, and saved items.
 *
 * Cross-references are deliberate — every jobId exists in mockJobs.js and every userId
 * exists in mockUsers.js, so the recruiter pipeline and the developer's application list
 * are reading the same truth. The store validates this on load.
 */

import { FIXED_NOW } from './mockJobs.js';

const at = (daysAgo) => new Date(Date.parse(FIXED_NOW) - daysAgo * 86400000).toISOString();

/**
 * Applications spanning every status, attached to real recruiters' postings so both
 * sides of the workflow have something to act on.
 * @type {import('../types/index.js').Application[]}
 */
export const APPLICATIONS = [
  {
    id: 'app-priya-nw-ts',
    jobId: 'nw-ts-fullstack',
    userId: 'priya-raman',
    status: 'interview',
    appliedAt: at(6),
    updatedAt: at(2),
    coverNote:
      'I rebuilt checkout at Lumen Commerce as a typed Next.js app and own the Postgres side of it too, so the span explorer work reads like a familiar problem. Happy to walk through how I cut aborted payments by 18% — it was mostly latency and state handling, not redesign.',
    timeline: [
      { status: 'applied', at: at(6), by: 'developer' },
      { status: 'under-review', at: at(4), by: 'recruiter', note: 'Portfolio review passed; forwarding to the platform loop.' },
      { status: 'interview', at: at(2), by: 'recruiter', note: 'Scheduled a 90-minute systems conversation.' },
    ],
    interview: { note: 'Virtual call with Nathan and Tobias — collector trade-offs and query contracts.', scheduledFor: at(-3) },
  },
  {
    id: 'app-priya-bl-canvas',
    jobId: 'bl-canvas-eng',
    userId: 'priya-raman',
    status: 'under-review',
    appliedAt: at(3),
    updatedAt: at(1),
    coverNote:
      'Six years of React where the render budget was a real constraint. I have not worked on a canvas product, but I have profiled and fixed the class of interaction lag this one lives or dies by.',
    timeline: [
      { status: 'applied', at: at(3), by: 'developer' },
      { status: 'under-review', at: at(1), by: 'recruiter', note: 'Hana is reading the checkout rewrite write-up.' },
    ],
    interview: null,
  },
  {
    id: 'app-priya-vf-backend',
    jobId: 'vf-backend',
    userId: 'priya-raman',
    status: 'applied',
    appliedAt: at(1),
    updatedAt: at(1),
    coverNote:
      'I do not bring Python or FastAPI experience, which you should weigh honestly. What I do bring is multi-tenant API design and the retry semantics that make a queue boring at 3am.',
    timeline: [{ status: 'applied', at: at(1), by: 'developer' }],
    interview: null,
  },
  {
    id: 'app-priya-cl-fullstack',
    jobId: 'cl-fullstack',
    userId: 'priya-raman',
    status: 'offer',
    appliedAt: at(24),
    updatedAt: at(5),
    coverNote:
      'I built the dataset explorer at CivicLoop between 2020 and 2023, so I already know this codebase problem from the inside. I left for scope, and I would come back for the same reason.',
    timeline: [
      { status: 'applied', at: at(24), by: 'developer' },
      { status: 'under-review', at: at(21), by: 'recruiter' },
      { status: 'interview', at: at(14), by: 'recruiter', note: 'Two loops: frontend craft and a pairing exercise.' },
      { status: 'offer', at: at(5), by: 'recruiter', note: 'Offer extended, valid for ten days.' },
    ],
    interview: { note: 'Completed — pairing exercise on export pagination.', scheduledFor: at(14) },
  },
  {
    id: 'app-priya-aa-sr-data',
    jobId: 'aa-sr-data',
    userId: 'priya-raman',
    status: 'rejected',
    appliedAt: at(30),
    updatedAt: at(26),
    coverNote: 'Applying against the brief: strong product engineering, lighter Spark experience than the role wants.',
    timeline: [
      { status: 'applied', at: at(30), by: 'developer' },
      { status: 'under-review', at: at(28), by: 'recruiter' },
      { status: 'rejected', at: at(26), by: 'recruiter', note: 'Went with someone who has run a Spark re-platform before. Keep in touch.' },
    ],
    interview: null,
  },
  {
    id: 'app-priya-lc-qa',
    jobId: 'lc-qa',
    userId: 'priya-raman',
    status: 'withdrawn',
    appliedAt: at(12),
    updatedAt: at(9),
    coverNote: 'Withdrawn after taking the Northwind loop seriously — wrong role for me, good company.',
    timeline: [
      { status: 'applied', at: at(12), by: 'developer' },
      { status: 'withdrawn', at: at(9), by: 'developer', note: 'Withdrew to focus on full-stack loops.' },
    ],
    interview: null,
  },
  {
    id: 'app-diego-nw-ts',
    jobId: 'nw-ts-fullstack',
    userId: 'diego-marchant',
    status: 'under-review',
    appliedAt: at(4),
    updatedAt: at(2),
    coverNote: 'Console and run-history API work at Atlas — similar shape to what you describe for the explorer.',
    timeline: [
      { status: 'applied', at: at(4), by: 'developer' },
      { status: 'under-review', at: at(2), by: 'recruiter' },
    ],
    interview: null,
  },
  {
    id: 'app-wei-nw-collector',
    jobId: 'nw-collector-rust',
    userId: 'wei-zhang',
    status: 'interview',
    appliedAt: at(8),
    updatedAt: at(3),
    coverNote: 'Ledger work has taught me the durability discipline a collector needs. Rust yes, flamegraphs happily.',
    timeline: [
      { status: 'applied', at: at(8), by: 'developer' },
      { status: 'under-review', at: at(6), by: 'recruiter' },
      { status: 'interview', at: at(3), by: 'recruiter' },
    ],
    interview: { note: 'Deep-dive on ingest backpressure with Lukas.', scheduledFor: at(-2) },
  },
  {
    id: 'app-lukas-nw-collector',
    jobId: 'nw-collector-rust',
    userId: 'lukas-brandt',
    status: 'offer',
    appliedAt: at(35),
    updatedAt: at(7),
    coverNote: 'I already rewrote your exact problem at Northwind; I would like to do the next one.',
    timeline: [
      { status: 'applied', at: at(35), by: 'developer' },
      { status: 'under-review', at: at(31), by: 'recruiter' },
      { status: 'interview', at: at(20), by: 'recruiter' },
      { status: 'offer', at: at(7), by: 'recruiter', note: 'Verbal offer; written package to follow.' },
    ],
    interview: { note: 'Completed two loops, onsite in Munich.', scheduledFor: at(20) },
  },
  {
    id: 'app-ruben-hf-go',
    jobId: 'hf-go-migration',
    userId: 'ruben-oster',
    status: 'under-review',
    appliedAt: at(2),
    updatedAt: at(1),
    coverNote: 'Eleven years of long-lived Java services and three monolith extractions. The reconciliation-harness framing in this post is exactly how I would do it.',
    timeline: [
      { status: 'applied', at: at(2), by: 'developer' },
      { status: 'under-review', at: at(1), by: 'recruiter' },
    ],
    interview: null,
  },
  {
    id: 'app-marcus-lc-payments',
    jobId: 'lc-payments',
    userId: 'marcus-adeyemi',
    status: 'applied',
    appliedAt: at(1),
    updatedAt: at(1),
    coverNote: 'Routing and reconciliation work at Harborstack; comfortable owning an idempotency story.',
    timeline: [{ status: 'applied', at: at(1), by: 'developer' }],
    interview: null,
  },
  {
    id: 'app-clara-bl-canvas',
    jobId: 'bl-canvas-eng',
    userId: 'clara-mendes',
    status: 'rejected',
    appliedAt: at(16),
    updatedAt: at(11),
    coverNote: 'Design engineer applying for a canvas systems role — probably a level short, worth trying.',
    timeline: [
      { status: 'applied', at: at(16), by: 'developer' },
      { status: 'rejected', at: at(11), by: 'recruiter', note: 'Not for the rendering layer. We would like you for the design-systems opening instead.' },
    ],
    interview: null,
  },
  {
    id: 'app-elena-bl-ds',
    jobId: 'bl-ds',
    userId: 'elena-sorensen',
    status: 'interview',
    appliedAt: at(9),
    updatedAt: at(4),
    coverNote: 'I own a component library today and have the versioning policy write-up to prove it.',
    timeline: [
      { status: 'applied', at: at(9), by: 'developer' },
      { status: 'under-review', at: at(7), by: 'recruiter' },
      { status: 'interview', at: at(4), by: 'recruiter' },
    ],
    interview: { note: 'Portfolio walkthrough with Hana.', scheduledFor: at(-1) },
  },
  {
    id: 'app-kwabena-mh-backend',
    jobId: 'mh-backend',
    userId: 'kwabena-mensah',
    status: 'applied',
    appliedAt: at(2),
    updatedAt: at(2),
    coverNote: 'Clinician app work at Meridian has given me strong opinions about FHIR and offline queues.',
    timeline: [{ status: 'applied', at: at(2), by: 'developer' }],
    interview: null,
  },
  {
    id: 'app-ingrid-aa-sr-data',
    jobId: 'aa-sr-data',
    userId: 'ingrid-halvorsen',
    status: 'offer',
    appliedAt: at(28),
    updatedAt: at(6),
    coverNote: 'Re-platformed ingestion at Atlas already; I know what the schema-contract work costs.',
    timeline: [
      { status: 'applied', at: at(28), by: 'developer' },
      { status: 'under-review', at: at(25), by: 'recruiter' },
      { status: 'interview', at: at(15), by: 'recruiter' },
      { status: 'offer', at: at(6), by: 'recruiter', note: 'Contract terms sent.' },
    ],
    interview: { note: 'Completed — technical and team fit.', scheduledFor: at(15) },
  },
  // --- Against the review account's own postings: every pipeline status represented,
  //     so the superuser sees a full recruiter board without borrowing another
  //     recruiter's numbers. ---
  {
    id: 'app-tobias-mh-staff',
    jobId: 'mh-scheduling-staff',
    userId: 'tobias-keller',
    status: 'interview',
    appliedAt: at(5),
    updatedAt: at(1),
    coverNote:
      'Nine years keeping deploy-time consistency under load. Conflict resolution on bookings is a smaller blast radius than what I do now, which appeals to me.',
    timeline: [
      { status: 'applied', at: at(5), by: 'developer' },
      { status: 'under-review', at: at(4), by: 'recruiter' },
      { status: 'interview', at: at(1), by: 'recruiter', note: 'Loop starts with the replay-log design conversation.' },
    ],
    interview: { note: 'Virtual — booking conflict model and the audit trail.', scheduledFor: at(-4) },
  },
  {
    id: 'app-priya-mh-staff',
    jobId: 'mh-scheduling-staff',
    userId: 'priya-raman',
    status: 'under-review',
    appliedAt: at(3),
    updatedAt: at(1),
    coverNote:
      'I have owned a Postgres-backed write path where being wrong meant money. A booking double-sold is the same class of failure with a clinician instead of a customer.',
    timeline: [
      { status: 'applied', at: at(3), by: 'developer' },
      { status: 'under-review', at: at(1), by: 'recruiter', note: 'Reading the checkout rewrite write-up for the concurrency story.' },
    ],
    interview: null,
  },
  {
    id: 'app-diego-mh-access',
    jobId: 'mh-accessibility-eng',
    userId: 'diego-marchant',
    status: 'offer',
    appliedAt: at(10),
    updatedAt: at(2),
    coverNote:
      'Shipped the keyboard model on our query builder and lost an argument about it twice, which is how I know I would push back here too.',
    timeline: [
      { status: 'applied', at: at(10), by: 'developer' },
      { status: 'under-review', at: at(8), by: 'recruiter' },
      { status: 'interview', at: at(6), by: 'recruiter', note: 'Pairing session on a screen-reader defect.' },
      { status: 'offer', at: at(2), by: 'recruiter', note: 'Offer extended, valid for ten days.' },
    ],
    interview: { note: 'Completed — paired on an inaccessible date picker.', scheduledFor: at(6) },
  },
  {
    id: 'app-ingrid-mh-access',
    jobId: 'mh-accessibility-eng',
    userId: 'ingrid-halvorsen',
    status: 'applied',
    appliedAt: at(1),
    updatedAt: at(1),
    coverNote:
      'Honest about the gap: my accessibility work is warehouse-facing. What I do bring is writing regression suites that refuse to pass on a broken contract.',
    timeline: [{ status: 'applied', at: at(1), by: 'developer' }],
    interview: null,
  },
  {
    id: 'app-felipe-mh-access',
    jobId: 'mh-accessibility-eng',
    userId: 'felipe-castro',
    status: 'rejected',
    appliedAt: at(9),
    updatedAt: at(7),
    coverNote:
      'I fixed the two worst keyboard traps in our export screen on my own initiative, and nobody asked me to.',
    timeline: [
      { status: 'applied', at: at(9), by: 'developer' },
      { status: 'under-review', at: at(8), by: 'recruiter' },
      { status: 'rejected', at: at(7), by: 'recruiter', note: 'Not yet at the depth this role needs on screen-reader internals. Reapply in eighteen months.' },
    ],
    interview: null,
  },
  {
    id: 'app-omid-mh-records',
    jobId: 'mh-records-eng',
    userId: 'omid-rashidi',
    status: 'withdrawn',
    appliedAt: at(58),
    updatedAt: at(52),
    coverNote: 'Contract shape suited the year I was having.',
    timeline: [
      { status: 'applied', at: at(58), by: 'developer' },
      { status: 'withdrawn', at: at(52), by: 'developer', note: 'Took a permanent role closer to home.' },
    ],
    interview: null,
  },
  // --- The review account on the other side of the counter: it applies too, so the
  //     application tracker and detail screens are populated for the same login that
  //     owns a pipeline. ---
  {
    id: 'app-avery-cl-fullstack',
    jobId: 'cl-fullstack',
    userId: 'avery-sandoval',
    status: 'interview',
    appliedAt: at(7),
    updatedAt: at(2),
    coverNote:
      'I built the export layer you now maintain, so I know exactly which part of it will fight me. That is an argument for hiring me or against me depending on the day.',
    timeline: [
      { status: 'applied', at: at(7), by: 'developer' },
      { status: 'under-review', at: at(5), by: 'recruiter' },
      { status: 'interview', at: at(2), by: 'recruiter', note: 'Systems conversation on the filings queue.' },
    ],
    interview: { note: 'Virtual with the platform leads.', scheduledFor: at(-6) },
  },
  {
    id: 'app-avery-rr-platform',
    jobId: 'rr-platform',
    userId: 'avery-sandoval',
    status: 'applied',
    appliedAt: at(2),
    updatedAt: at(2),
    coverNote: 'Long-lived services and a review culture that argues about them properly.',
    timeline: [{ status: 'applied', at: at(2), by: 'developer' }],
    interview: null,
  },
];

/** @typedef {import('../types/index.js').Connection} Connection */

/**
 * Connection graph for the demo developer (priya-raman) plus background relationships so
 * discovery pages can show real states rather than one universal "Connect" button.
 * @type {Connection[]}
 */
export const CONNECTIONS = [
  { id: 'conn-priya-elena', fromUserId: 'elena-sorensen', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(120), respondedAt: at(118) },
  { id: 'conn-priya-diego', fromUserId: 'priya-raman', toUserId: 'diego-marchant', state: 'accepted', requestedAt: at(96), respondedAt: at(94) },
  { id: 'conn-nadia-priya', fromUserId: 'nadia-belkacem', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(80), respondedAt: at(79) },
  { id: 'conn-victor-priya', fromUserId: 'victor-olaru', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(64), respondedAt: at(60), message: 'Worth staying in touch after the ingest talk.' },
  { id: 'conn-hanaa-priya', fromUserId: 'hanaa-elsayed', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(52), respondedAt: at(51) },
  { id: 'conn-clara-priya', fromUserId: 'clara-mendes', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(41), respondedAt: at(39) },
  { id: 'conn-grace-priya', fromUserId: 'grace-ombata', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(33), respondedAt: at(30) },
  { id: 'conn-samuel-priya', fromUserId: 'samuel-okonkwo', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(26), respondedAt: at(25) },
  { id: 'conn-julia-priya', fromUserId: 'julia-nowak', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(18), respondedAt: at(17) },
  { id: 'conn-omar-priya', fromUserId: 'omid-rashidi', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(12), respondedAt: at(11) },

  // Incoming, awaiting the demo developer's decision.
  { id: 'conn-felipe-priya', fromUserId: 'felipe-castro', toUserId: 'priya-raman', state: 'pending', requestedAt: at(2), message: 'I finished the explorer work you started at CivicLoop — would value a few questions about the export layer.' },
  { id: 'conn-aiko-priya', fromUserId: 'aiko-tanaka', toUserId: 'priya-raman', state: 'pending', requestedAt: at(3), message: 'We should compare notes on auth surfaces before your next checkout refactor.' },
  { id: 'conn-ingrid-priya', fromUserId: 'ingrid-halvorsen', toUserId: 'priya-raman', state: 'pending', requestedAt: at(5), message: 'Atlas ingest and your console work touch the same contracts.' },
  { id: 'conn-ruben-priya', fromUserId: 'ruben-oster', toUserId: 'priya-raman', state: 'pending', requestedAt: at(7) },

  // Outgoing, awaiting the other side.
  { id: 'conn-priya-sara', fromUserId: 'priya-raman', toUserId: 'sara-bennani', state: 'pending', requestedAt: at(4), message: 'Your eval harness write-up changed how I think about frontend regression testing.' },
  { id: 'conn-priya-tobias', fromUserId: 'priya-raman', toUserId: 'tobias-keller', state: 'pending', requestedAt: at(9), message: 'Northwind deploy-time work is the reference I keep citing.' },

  // Rejected, kept so state handling is demonstrable rather than hypothetical.
  { id: 'conn-spam-priya', fromUserId: 'marcus-adeyemi', toUserId: 'priya-raman', state: 'rejected', requestedAt: at(45), respondedAt: at(44), message: 'Declined — I only keep practitioner connections here.' },

  // --- The review account's own graph, so Network shows all four states for it too. ---
  { id: 'conn-avery-priya', fromUserId: 'avery-sandoval', toUserId: 'priya-raman', state: 'accepted', requestedAt: at(30), respondedAt: at(29) },
  { id: 'conn-tobias-avery', fromUserId: 'tobias-keller', toUserId: 'avery-sandoval', state: 'accepted', requestedAt: at(21), respondedAt: at(20), message: 'Worth staying in touch whether or not the loop lands.' },
  { id: 'conn-diego-avery', fromUserId: 'diego-marchant', toUserId: 'avery-sandoval', state: 'accepted', requestedAt: at(14), respondedAt: at(13) },
  { id: 'conn-aiko-avery', fromUserId: 'aiko-tanaka', toUserId: 'avery-sandoval', state: 'pending', requestedAt: at(3), message: 'You posted the rubric rewrite — I would like to argue about one section.' },
  { id: 'conn-ingrid-avery', fromUserId: 'ingrid-halvorsen', toUserId: 'avery-sandoval', state: 'pending', requestedAt: at(1) },
  { id: 'conn-avery-elena', fromUserId: 'avery-sandoval', toUserId: 'elena-sorensen', state: 'pending', requestedAt: at(6) },
  { id: 'conn-wei-avery', fromUserId: 'wei-zhang', toUserId: 'avery-sandoval', state: 'rejected', requestedAt: at(40), respondedAt: at(39), message: 'Declined — not the right surface for me.' },

  // Background relationships between other developers.
  { id: 'conn-tobias-marcus', fromUserId: 'marcus-adeyemi', toUserId: 'tobias-keller', state: 'accepted', requestedAt: at(70), respondedAt: at(68) },
  { id: 'conn-sara-imani', fromUserId: 'sara-bennani', toUserId: 'imani-wright', state: 'accepted', requestedAt: at(55), respondedAt: at(54) },
  { id: 'conn-lukas-tobias', fromUserId: 'lukas-brandt', toUserId: 'tobias-keller', state: 'accepted', requestedAt: at(22), respondedAt: at(21) },
  { id: 'conn-wei-helios', fromUserId: 'wei-zhang', toUserId: 'aiko-tanaka', state: 'accepted', requestedAt: at(38), respondedAt: at(35) },
  { id: 'conn-grace-nadia', fromUserId: 'grace-ombata', toUserId: 'nadia-belkacem', state: 'pending', requestedAt: at(1) },
];

/** Saved jobs per user, and saved candidates per recruiter. */
export const SAVED_JOBS = {
  'priya-raman': ['nw-react-query', 'hf-go-migration', 'rr-platform'],
  'nathan-boone': ['vf-sr-ml'],
  'avery-sandoval': ['nw-ts-fullstack', 'hf-go-migration', 'vf-sr-ml'],
};

export const SAVED_CANDIDATES = {
  'nathan-boone': ['priya-raman', 'diego-marchant', 'tobias-keller', 'julia-nowak'],
  'imani-wright': ['sara-bennani', 'ingrid-halvorsen'],
  'hana-oyelaran': ['elena-sorensen', 'clara-mendes'],
  'avery-sandoval': ['priya-raman', 'diego-marchant', 'ingrid-halvorsen'],
};
