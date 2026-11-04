/**
 * Seed GitHub-shaped repository data and hand-authored portfolio projects.
 *
 * All of it is invented. Nothing here is fetched from GitHub, and no account is actually
 * connected — the UI must label this as a mock integration (see githubService).
 */

import { buildContributions } from './mockUsers.js';

const daysAgo = (n) => new Date(Date.parse('2026-11-01T12:00:00.000Z') - n * 86400000).toISOString();

const repo = (input) => ({
  id: input.id,
  userId: input.userId,
  name: input.name,
  description: input.description,
  language: input.language,
  topics: input.topics,
  stars: input.stars,
  forks: input.forks,
  watchers: Math.max(3, Math.round(input.stars * 0.12)),
  pushedAt: daysAgo(input.pushedDaysAgo),
  url: `https://github.com/${input.owner}/${input.name}`,
  isPinned: input.pinned ?? false,
  contributions: buildContributions(input.seed, input.intensity ?? 0.45),
  openIssues: input.openIssues ?? 0,
  license: input.license ?? 'MIT',
  defaultBranch: input.defaultBranch ?? 'main',
});

/** Priya's repositories — the demo developer's GitHub section. */
const PRIYA_REPOS = [
  repo({
    id: 'repo-priya-querydeck',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'querydeck',
    description:
      'Keyboard-first SQL workbench for Postgres. Virtualised results grid, EXPLAIN visualiser, and a completion engine that reads your schema instead of guessing.',
    language: 'TypeScript',
    topics: ['postgres', 'sql', 'editor', 'developer-tools'],
    stars: 1284,
    forks: 96,
    pushedDaysAgo: 1,
    seed: 1011,
    intensity: 0.72,
    pinned: true,
    openIssues: 14,
    defaultBranch: 'main',
  }),
  repo({
    id: 'repo-priya-checkout-kit',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'checkout-kit',
    description:
      'Headless React checkout primitives with an idempotency-first API. Extracted from production at Lumen Commerce, stripped of vendor specifics.',
    language: 'TypeScript',
    topics: ['react', 'payments', 'headless', 'ecommerce'],
    stars: 742,
    forks: 58,
    pushedDaysAgo: 4,
    seed: 2027,
    intensity: 0.58,
    pinned: true,
    openIssues: 7,
  }),
  repo({
    id: 'repo-priya-token-pipe',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'token-pipe',
    description:
      'Turns a Figma variable collection into CSS custom properties plus typed tokens. Runs in CI and fails on naming drift.',
    language: 'JavaScript',
    topics: ['design-tokens', 'figma', 'css', 'ci'],
    stars: 389,
    forks: 31,
    pushedDaysAgo: 9,
    seed: 3041,
    intensity: 0.4,
    pinned: true,
    license: 'Apache-2.0',
  }),
  repo({
    id: 'repo-priya-a11y-rules',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'a11y-rules',
    description:
      'Twelve eslint-plugin-jsx-a11y rules the default set misses, written against real audit findings. Each rule links to the ticket that produced it.',
    language: 'TypeScript',
    topics: ['accessibility', 'eslint', 'wcag'],
    stars: 214,
    forks: 19,
    pushedDaysAgo: 21,
    seed: 4099,
    intensity: 0.26,
    openIssues: 3,
  }),
  repo({
    id: 'repo-priya-edge-cache',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'edge-cache-lab',
    description:
      'Benchmarks comparing stale-while-revalidate strategies at the edge for a product detail page. Includes the flamegraphs and the honest failures.',
    language: 'TypeScript',
    topics: ['performance', 'edge', 'benchmark'],
    stars: 96,
    forks: 8,
    pushedDaysAgo: 34,
    seed: 5127,
    intensity: 0.2,
  }),
  repo({
    id: 'repo-priya-node-retry',
    userId: 'priya-raman',
    owner: 'priyarman',
    name: 'node-retry-mate',
    description:
      'Retry and circuit-breaker helpers for Node service-to-service calls, with jitter that does not stampede. Small, tested, opinionated about timeouts.',
    language: 'JavaScript',
    topics: ['node', 'resilience', 'microservices'],
    stars: 61,
    forks: 6,
    pushedDaysAgo: 58,
    seed: 6211,
    intensity: 0.14,
  }),
];

/** Background repositories for other developers, so any profile can render a GitHub block. */
const OTHER_REPOS = [
  repo({ id: 'repo-marcus-drift', userId: 'marcus-adeyemi', owner: 'madeyemi', name: 'drift', description: 'Go library for schema-drift detection on append-only Postgres tables.', language: 'Go', topics: ['go', 'postgres', 'schema'], stars: 903, forks: 74, pushedDaysAgo: 2, seed: 7001, intensity: 0.6, pinned: true }),
  repo({ id: 'repo-marcus-recon', userId: 'marcus-adeyemi', owner: 'madeyemi', name: 'recon-job', description: 'Shadow-reconciliation harness for migrating a live money-movement path without switching traffic.', language: 'Go', topics: ['reconciliation', 'payments'], stars: 288, forks: 21, pushedDaysAgo: 12, seed: 7002, intensity: 0.44 }),
  repo({ id: 'repo-elena-canvas-core', userId: 'elena-sorensen', owner: 'elenasorensen', name: 'canvas-core', description: 'Hit-testing and transform maths for a collaborative design canvas, dependency-free.', language: 'TypeScript', topics: ['canvas', 'graphics', 'react'], stars: 1640, forks: 132, pushedDaysAgo: 1, seed: 7003, intensity: 0.75, pinned: true }),
  repo({ id: 'repo-elena-budget', userId: 'elena-sorensen', owner: 'elenasorensen', name: 'render-budget', description: 'Enforces a per-route paint budget in CI. Fails the build, not the deploy.', language: 'TypeScript', topics: ['performance', 'ci'], stars: 431, forks: 27, pushedDaysAgo: 16, seed: 7004, intensity: 0.33 }),
  repo({ id: 'repo-tobias-kube-cost', userId: 'tobias-keller', owner: 'tkeller', name: 'kube-cost', description: 'Per-namespace Kubernetes cost attribution that does not need a vendor agent.', language: 'Go', topics: ['kubernetes', 'finops'], stars: 1120, forks: 88, pushedDaysAgo: 5, seed: 7005, intensity: 0.55, pinned: true }),
  repo({ id: 'repo-lukas-spanline', userId: 'lukas-brandt', owner: 'lbrandt', name: 'spanline', description: 'Zero-alloc span decoder in Rust for the collector hot path. Benchmarked against OTel.', language: 'Rust', topics: ['rust', 'opentelemetry', 'performance'], stars: 674, forks: 43, pushedDaysAgo: 3, seed: 7006, intensity: 0.68, pinned: true }),
  repo({ id: 'repo-sara-evalbench', userId: 'sara-bennani', owner: 'sarabennani', name: 'evalbench', description: 'Reproducible evaluation harness for retrieval pipelines, with dataset versioning baked in.', language: 'Python', topics: ['llm', 'evaluation', 'retrieval'], stars: 2065, forks: 178, pushedDaysAgo: 1, seed: 7007, intensity: 0.8, pinned: true }),
  repo({ id: 'repo-ingrid-schemaguard', userId: 'ingrid-halvorsen', owner: 'ihalvorsen', name: 'schemaguard', description: 'Contract tests for Spark pipelines that fail loudly when an upstream column changes meaning.', language: 'Python', topics: ['spark', 'data-quality'], stars: 512, forks: 39, pushedDaysAgo: 8, seed: 7008, intensity: 0.5 }),
  repo({ id: 'repo-kwabena-offlinequeue', userId: 'kwabena-mensah', owner: 'kmensah', name: 'OfflineWriteQueue', description: 'Swift package for durable offline writes on iOS. Survives force-quit and an eight-hour shift.', language: 'Swift', topics: ['ios', 'offline-first', 'swift'], stars: 348, forks: 24, pushedDaysAgo: 6, seed: 7009, intensity: 0.46, pinned: true }),
  repo({ id: 'repo-grace-slimstart', userId: 'grace-ombata', owner: 'graceombata', name: 'slimstart', description: 'Cold-start profiling toolkit for React Native on low-end Android devices.', language: 'TypeScript', topics: ['react-native', 'performance'], stars: 267, forks: 18, pushedDaysAgo: 11, seed: 7010, intensity: 0.4 }),
  repo({ id: 'repo-samuel-pagerlight', userId: 'samuel-okonkwo', owner: 'som-k8s', name: 'pagerlight', description: 'On-call rotas and SLO burn-rate alerting without a Datadog bill.', language: 'Python', topics: ['sre', 'prometheus', 'alerting'], stars: 894, forks: 66, pushedDaysAgo: 2, seed: 7011, intensity: 0.58, pinned: true }),
  repo({ id: 'repo-julia-flakebudget', userId: 'julia-nowak', owner: 'jnowak', name: 'flake-budget', description: 'Tracks per-spec flake rate across CI runs and quarantines anything over budget automatically.', language: 'TypeScript', topics: ['playwright', 'ci', 'testing'], stars: 476, forks: 33, pushedDaysAgo: 7, seed: 7012, intensity: 0.52, pinned: true }),
  repo({ id: 'repo-wei-ledgerlite', userId: 'wei-zhang', owner: 'wzhang', name: 'ledgerlite', description: 'Double-entry ledger core with provable invariants, extracted from a production payments system.', language: 'Elixir', topics: ['elixir', 'payments', 'ledgers'], stars: 1385, forks: 104, pushedDaysAgo: 4, seed: 7013, intensity: 0.62, pinned: true }),
  repo({ id: 'repo-clara-motion-kit', userId: 'clara-mendes', owner: 'claramendes', name: 'motion-kit', description: 'Small Svelte motion primitives with a reduced-motion first class API.', language: 'Svelte', topics: ['svelte', 'animation', 'accessibility'], stars: 623, forks: 41, pushedDaysAgo: 9, seed: 7014, intensity: 0.45, pinned: true }),
  repo({ id: 'repo-diego-connector', userId: 'diego-marchant', owner: 'dmarchant', name: 'tiny-connector', description: 'Single-file Postgres to S3 exporter with resumable offsets. No framework, no daemon.', language: 'TypeScript', topics: ['etl', 'postgres', 's3'], stars: 158, forks: 12, pushedDaysAgo: 19, seed: 7015, intensity: 0.35 }),
  repo({ id: 'repo-aiko-headeraudit', userId: 'aiko-tanaka', owner: 'aiko-t', name: 'header-audit', description: 'CI checker for the response headers your payment product ships with, mapped to compliance evidence.', language: 'Python', topics: ['security', 'compliance', 'ci'], stars: 331, forks: 22, pushedDaysAgo: 26, seed: 7016, intensity: 0.3 }),
];

/**
 * The review account's repositories. Its GitHub block reads as connected, so an empty
 * list there would look like a bug rather than a state.
 */
const AVERY_REPOS = [
  repo({ id: 'repo-avery-bookings', userId: 'avery-sandoval', owner: 'averysandoval', name: 'booking-lattice', description: 'Conflict-resolution library for clinic scheduling. Models clinician hours as a lattice so a double-booking is unrepresentable instead of checked for.', language: 'TypeScript', topics: ['scheduling', 'postgres', 'concurrency'], stars: 412, forks: 38, pushedDaysAgo: 2, seed: 7101, intensity: 0.62, pinned: true, openIssues: 7 }),
  repo({ id: 'repo-avery-auditlog', userId: 'avery-sandoval', owner: 'averysandoval', name: 'plain-english-audit', description: 'Turns an append-only event log into the sentence a regulator actually wants to read.', language: 'Node.js', topics: ['audit', 'event-sourcing', 'accessibility'], stars: 168, forks: 14, pushedDaysAgo: 9, seed: 7102, intensity: 0.4 }),
  repo({ id: 'repo-avery-loopkit', userId: 'avery-sandoval', owner: 'averysandoval', name: 'loopkit', description: 'Interview-loop rubric tool: panelists score the same artefact and the spread between them is visible.', language: 'React', topics: ['hiring', 'rubrics', 'dx'], stars: 96, forks: 11, pushedDaysAgo: 21, seed: 7103, intensity: 0.28, license: 'Apache-2.0' }),
];

/** @type {import('../types/index.js').Repository[]} */
export const REPOSITORIES = [...PRIYA_REPOS, ...AVERY_REPOS, ...OTHER_REPOS];

/**
 * Portfolio projects — curated, human-written entries distinct from raw repositories.
 * @type {import('../types/index.js').Project[]}
 */
export const PROJECTS = [
  {
    id: 'proj-priya-checkout',
    userId: 'priya-raman',
    title: 'Checkout rewrite at Lumen Commerce',
    summary:
      'Replaced a jQuery checkout with a typed Next.js app across four steps. Cut aborted-payment sessions 18% and first render by 900ms, measured against the old funnel rather than a synthetic lab.',
    tags: ['React', 'TypeScript', 'Web Performance', 'Payments'],
    url: 'https://lumencommerce.example.co.uk',
    repoUrl: 'https://github.com/priyarman/checkout-kit',
    period: '2024-2025',
    featured: true,
  },
  {
    id: 'proj-priya-explorer',
    userId: 'priya-raman',
    title: 'Civic dataset explorer',
    summary:
      'The public tool three municipal agencies still run on: faceted search over 40k datasets, streaming CSV export, and an embed mode journalists use. Shipped with a 180KB budget on purpose.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Accessibility'],
    url: 'https://civicloop.example.in/explorer',
    period: '2021-2023',
    featured: true,
  },
  {
    id: 'proj-priya-querydeck',
    userId: 'priya-raman',
    title: 'querydeck',
    summary:
      'Open-source SQL workbench. The interesting part is the completion engine: it reads live schema and prior query history rather than guessing from a static grammar.',
    tags: ['TypeScript', 'PostgreSQL', 'Developer Tools'],
    url: 'https://github.com/priyarman/querydeck',
    repoUrl: 'https://github.com/priyarman/querydeck',
    period: '2025-now',
    featured: true,
  },
  {
    id: 'proj-priya-tokens',
    userId: 'priya-raman',
    title: 'Design token pipeline',
    summary:
      'Build-time tool that keeps Figma variables and CSS custom properties honest, and fails CI the moment someone invents a one-off colour.',
    tags: ['Design Systems', 'CI/CD', 'CSS'],
    repoUrl: 'https://github.com/priyarman/token-pipe',
    period: '2024',
    featured: false,
  },
  {
    id: 'proj-elena-canvas',
    userId: 'elena-sorensen',
    title: 'Brightloom canvas component library',
    summary:
      'Forty-two primitives, one rendering budget enforced in CI, and a documented deprecation policy that survived three product rewrites.',
    tags: ['React', 'Design Systems', 'Web Performance'],
    url: 'https://brightloom.example.de',
    period: '2021-2026',
    featured: true,
  },
  {
    id: 'proj-marcus-routing',
    userId: 'marcus-adeyemi',
    title: 'Berth routing service',
    summary:
      'Rewrote dock route computation from a Python prototype into Go. Median solve time went from 420ms to 61ms under the same hardware.',
    tags: ['Go', 'System Design', 'Logistics'],
    period: '2023-2025',
    featured: true,
  },
  {
    id: 'proj-sara-evals',
    userId: 'sara-bennani',
    title: 'Retrieval evaluation suite',
    summary:
      'The benchmark Vector Foundry demos with: versioned datasets, reproducible runs, and a comparison view that makes regression obvious instead of arguable.',
    tags: ['Python', 'Machine Learning', 'LLM Integration'],
    url: 'https://bennani.ml/eval-notes',
    repoUrl: 'https://github.com/sarabennani/evalbench',
    period: '2024-now',
    featured: true,
  },
  {
    id: 'proj-ingrid-ingest',
    userId: 'ingrid-halvorsen',
    title: 'Spark ingest re-platform',
    summary:
      'Moved customer ingestion onto Spark with schema contracts. Nightly run went from six hours to forty-seven minutes and started failing loudly instead of silently.',
    tags: ['Apache Spark', 'Airflow', 'Data Modeling'],
    period: '2023-2025',
    featured: false,
  },
  {
    id: 'proj-kwabena-clinician',
    userId: 'kwabena-mensah',
    title: 'Meridian clinician app',
    summary:
      'iOS scheduling for clinics with unreliable wifi. The offline write queue survives force-quit, which was the actual requirement once we watched real usage.',
    tags: ['iOS', 'Swift', 'Offline-first'],
    url: 'https://meridianhealth.example.ca',
    repoUrl: 'https://github.com/kmensah/OfflineWriteQueue',
    period: '2022-2026',
    featured: true,
  },
  {
    id: 'proj-samuel-slos',
    userId: 'samuel-okonkwo',
    title: 'On-call programme from zero',
    summary:
      'Built the rota, the SLOs, and the review template at Vector Foundry. MTTR fell from three hours to twenty-six minutes over two quarters, mostly by deleting noise.',
    tags: ['Observability', 'Prometheus', 'Incident Response'],
    repoUrl: 'https://github.com/som-k8s/pagerlight',
    period: '2023-2025',
    featured: false,
  },
  {
    id: 'proj-diego-console',
    userId: 'diego-marchant',
    title: 'Orchestration console',
    summary:
      'Run history, retries, and backfills for Atlas pipelines, built across the stack: schema, API, and UI in the same sprints.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    period: '2023-2025',
    featured: false,
  },
  {
    id: 'proj-clara-review-mode',
    userId: 'clara-mendes',
    title: 'Design review interaction layer',
    summary:
      'Comment pins, presence, and the motion guidelines now in Brightloom system docs. Written for people who watch the product on a trackpad during a standup.',
    tags: ['Svelte', 'Design Systems', 'Accessibility'],
    repoUrl: 'https://github.com/claramendes/motion-kit',
    period: '2024-now',
    featured: true,
  },
  {
    id: 'proj-avery-lattice',
    userId: 'avery-sandoval',
    title: 'Scheduling conflict engine',
    summary:
      'Replaced row-level locking on the booking table with a lattice model, so two clinics cannot take the same clinician hour at any isolation level. Zero double-bookings across eleven months.',
    tags: ['PostgreSQL', 'TypeScript', 'System Design', 'Healthcare'],
    url: 'https://meridianhealth.example.ca',
    repoUrl: 'https://github.com/averysandoval/booking-lattice',
    period: '2022-now',
    featured: true,
  },
  {
    id: 'proj-avery-loopkit',
    userId: 'avery-sandoval',
    title: 'Interview rubric tooling',
    summary:
      'Panelists score the same artefact and the disagreement between them is plotted. Cut our false-negative rate on the senior loop and made the debrief defensible in writing.',
    tags: ['React', 'Hiring', 'Developer Tools'],
    repoUrl: 'https://github.com/averysandoval/loopkit',
    period: '2024-now',
    featured: false,
  },
];
