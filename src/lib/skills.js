/**
 * Canonical skill vocabulary shared by seed data, profile editing, and the matcher.
 *
 * Free-text skills from seed data or the profile form are folded onto one canonical
 * spelling, so "React JS" and "reactjs" are treated as the same capability everywhere.
 */

/** Ordered by how likely a developer profile is to list them. */
export const CANONICAL_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Svelte',
  'Redux',
  'React Query',
  'Tailwind CSS',
  'CSS',
  'HTML',
  'Accessibility',
  'Node.js',
  'Express',
  'NestJS',
  'Deno',
  'Python',
  'Django',
  'FastAPI',
  'Flask',
  'Go',
  'Rust',
  'Java',
  'Spring Boot',
  'Kotlin',
  'Scala',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'Ruby',
  'Ruby on Rails',
  'Elixir',
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'DynamoDB',
  'ClickHouse',
  'Prisma',
  'GraphQL',
  'REST APIs',
  'gRPC',
  'WebSockets',
  'Kafka',
  'RabbitMQ',
  'AWS',
  'GCP',
  'Azure',
  'Terraform',
  'Pulumi',
  'Kubernetes',
  'Docker',
  'CI/CD',
  'GitHub Actions',
  'Jenkins',
  'Linux',
  'Observability',
  'Prometheus',
  'Grafana',
  'OpenTelemetry',
  'System Design',
  'Microservices',
  'Serverless',
  'SQL',
  'Data Modeling',
  'Apache Spark',
  'Airflow',
  'dbt',
  'ETL',
  'Machine Learning',
  'PyTorch',
  'TensorFlow',
  'LLM Integration',
  'Vector Search',
  'React Native',
  'Flutter',
  'Swift',
  'iOS',
  'Android',
  'Testing',
  'Jest',
  'Playwright',
  'Cypress',
  'Vitest',
  'Security',
  'Threat Modeling',
  'OAuth',
  'Performance Optimization',
  'Web Performance',
  'Design Systems',
  'Figma',
  'Agile',
  'Technical Writing',
  'Mentoring',
];

/** Lowercased alias -> canonical. Only spellings that differ beyond case. */
const ALIASES = {
  js: 'JavaScript',
  'vanilla js': 'JavaScript',
  'es6': 'JavaScript',
  ts: 'TypeScript',
  reactjs: 'React',
  'react js': 'React',
  'react native': 'React Native',
  nextjs: 'Next.js',
  'next js': 'Next.js',
  vuejs: 'Vue',
  'vue 3': 'Vue',
  'vue.js': 'Vue',
  'three js': 'Three.js',
  tailwind: 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'node js': 'Node.js',
  nodejs: 'Node.js',
  'express js': 'Express',
  expressjs: 'Express',
  py: 'Python',
  'python 3': 'Python',
  'postgres': 'PostgreSQL',
  'postgre': 'PostgreSQL',
  'pg': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongo db': 'MongoDB',
  'elastic': 'Elasticsearch',
  'elastic search': 'Elasticsearch',
  'openai api': 'LLM Integration',
  'openai': 'LLM Integration',
  langchain: 'LLM Integration',
  'amazon web services': 'AWS',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  'ms azure': 'Azure',
  k8s: 'Kubernetes',
  'continuous integration': 'CI/CD',
  'cicd': 'CI/CD',
  'gh actions': 'GitHub Actions',
  'a11y': 'Accessibility',
  'wcag': 'Accessibility',
  'ui engineering': 'React',
  'e2e testing': 'Playwright',
  'unit testing': 'Testing',
  'integration testing': 'Testing',
  'system architecture': 'System Design',
  'distributed systems': 'System Design',
  'sql tuning': 'SQL',
  'mysql database': 'MySQL',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'dotnet': '.NET',
  'rails': 'Ruby on Rails',
  'fastapi': 'FastAPI',
  'gpt': 'LLM Integration',
  'rag': 'Vector Search',
  'embeddings': 'Vector Search',
  'pinecone': 'Vector Search',
  'pgvector': 'Vector Search',
  'sentry': 'Observability',
  'datadog': 'Observability',
  'tracing': 'Observability',
  'caching': 'Redis',
  'orm': 'Prisma',
  'websockets': 'WebSockets',
  'websocket': 'WebSockets',
  'realtime': 'WebSockets',
  'flutter': 'Flutter',
  'dart': 'Flutter',
  'swiftui': 'Swift',
};

const CANONICAL_LOOKUP = new Map(CANONICAL_SKILLS.map((s) => [s.toLowerCase(), s]));

/**
 * Fold one free-text skill onto its canonical spelling.
 * Returns title-cased input when unknown, so user-entered skills still render cleanly.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeSkill(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (CANONICAL_LOOKUP.has(lower)) return CANONICAL_LOOKUP.get(lower);
  if (ALIASES[lower]) return ALIASES[lower];
  return trimmed
    .split(/\s+/)
    .map((word) => (word.length <= 2 ? word : word[0].toUpperCase() + word.slice(1)))
    .join(' ')
    .replace(/\bJs\b/, 'JS')
    .replace(/\bApi\b/, 'API');
}

/**
 * @param {string[]} raws
 * @returns {string[]} canonical, de-duplicated, order-preserving
 */
export function normalizeSkills(raws) {
  const seen = new Set();
  const out = [];
  for (const raw of raws ?? []) {
    const skill = normalizeSkill(raw);
    if (!skill || seen.has(skill.toLowerCase())) continue;
    seen.add(skill.toLowerCase());
    out.push(skill);
  }
  return out;
}

/** Case-insensitive membership test against canonicalized lists. */
export function hasSkill(pool, skill) {
  const target = normalizeSkill(skill).toLowerCase();
  return (pool ?? []).some((s) => normalizeSkill(s).toLowerCase() === target);
}

/** Skills most in demand across the mock job board; drives filter chips. */
export const POPULAR_SKILLS = [
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Python',
  'PostgreSQL',
  'AWS',
  'Kubernetes',
  'GraphQL',
  'Machine Learning',
];
