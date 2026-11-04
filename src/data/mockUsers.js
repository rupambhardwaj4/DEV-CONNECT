/**
 * Seed users and companies for the mock dataset.
 *
 * Every record is invented demonstration content for a frontend demo. Personas are
 * fictional; company names are fictional too. No real people or employers are depicted.
 *
 * Two accounts are the primary sample logins (see DEMO_CREDENTIALS):
 *   priya.raman — Priya Raman, senior full-stack engineer (developer experience)
 *   nathan.boone — Nathan Boone, talent partner (recruiter experience)
 */

/** Fixed PRNG so generated contribution grids are stable across loads, never re-rolled. */
function makeRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

/**
 * Deterministic 366-day contribution counts, weighted toward weekdays.
 * @param {number} seed
 * @param {number} intensity 0-1
 */
export function buildContributions(seed, intensity = 0.5) {
  const rand = makeRandom(seed);
  const out = [];
  for (let i = 0; i < 366; i += 1) {
    const weekday = i % 7;
    const weekendDip = weekday === 5 || weekday === 6 ? 0.35 : 1;
    const roll = rand();
    const value =
      roll > 1 - intensity * 0.55 * weekendDip
        ? Math.floor(rand() * 9 * intensity) + 1
        : 0;
    out.push(value);
  }
  return out;
}

const y = (value) => value;

/**
 * Compact developer factory. Defaults are tuned per persona below rather than shared,
 * so no two profiles read alike.
 */
function dev(input) {
  return {
    id: input.id,
    role: input.role ?? 'developer',
    name: input.name,
    email: input.email,
    headline: input.headline,
    location: input.location,
    avatar: input.avatar ?? null,
    bio: input.bio,
    skills: input.skills,
    experienceLevel: input.experienceLevel,
    yearsOfExperience: input.yearsOfExperience,
    githubUsername: input.githubUsername,
    website: input.website ?? null,
    linkedIn: input.linkedIn ?? null,
    twitter: input.twitter ?? null,
    openTo: input.openTo ?? 'new-roles',
    resume: input.resume ?? `${input.id.split('-').pop()}-resume.pdf`,
    emailVerified: input.emailVerified ?? true,
    visibility: input.visibility ?? 'public',
    notificationPrefs: {
      connectionRequests: true,
      applicationUpdates: true,
      jobMatches: input.notifyMatches ?? true,
      recruiterActivity: input.notifyRecruiter ?? true,
    },
    preferences: {
      workMode: input.workMode ?? 'remote',
      experienceLevel: input.experienceLevel,
      roleTypes: input.roleTypes ?? ['full-time'],
      minSalary: input.minSalary ?? null,
      locations: input.locationPref ?? [input.location],
    },
    experience: input.experience ?? [],
    education: input.education ?? [],
    createdAt: input.createdAt ?? '2025-06-01T09:00:00.000Z',
  };
}

export const COMPANIES = [
  {
    id: 'northwind-labs',
    name: 'Northwind Labs',
    industry: 'Developer observability',
    size: '51-200',
    location: 'Remote (US/EU)',
    website: 'https://northwind-labs.example.com',
    logoText: 'NL',
    blurb:
      'Northwind builds tracing and incident tooling for teams running event-driven backends. The platform team is small, fully distributed, and ships weekly.',
  },
  {
    id: 'vector-foundry',
    name: 'Vector Foundry',
    industry: 'Applied AI infrastructure',
    size: '11-50',
    location: 'Austin, TX',
    website: 'https://vectorfoundry.example.com',
    logoText: 'VF',
    blurb:
      'A seed-stage team building retrieval and evaluation infrastructure that LLM features can be tested against. Engineering-led culture, heavy on written process.',
  },
  {
    id: 'civicloop',
    name: 'CivicLoop',
    industry: 'Public-interest data',
    size: '11-50',
    location: 'Bengaluru, India',
    website: 'https://civicloop.example.in',
    logoText: 'CL',
    blurb:
      'CivicLoop publishes open datasets and mapping tools used by municipal agencies and journalists across India. Hybrid team, in-office Thursdays and Tuesdays.',
  },
  {
    id: 'helios-financial',
    name: 'Helios Financial',
    industry: 'Payments and lending',
    size: '201-500',
    location: 'Chicago, IL',
    website: 'https://heliosfinancial.example.com',
    logoText: 'HF',
    blurb:
      'Regulated payments processor moving from a .NET monolith to a Go services boundary. Platform and security work is scoped for the next eighteen months.',
  },
  {
    id: 'brightloom',
    name: 'Brightloom',
    industry: 'Design tooling',
    size: '11-50',
    location: 'Berlin, Germany',
    website: 'https://brightloom.example.de',
    logoText: 'BL',
    blurb:
      'Brightloom makes collaborative design review software. The whole product is one React canvas, so frontend craft matters more than headcount here.',
  },
  {
    id: 'harborstack',
    name: 'Harborstack',
    industry: 'Logistics software',
    size: '51-200',
    location: 'Rotterdam, Netherlands',
    website: 'https://harborstack.example.nl',
    logoText: 'HS',
    blurb:
      'Routing and dock scheduling for freight operators. Ships on-prem and cloud builds, so reliability work outranks feature velocity.',
  },
  {
    id: 'meridian-health',
    name: 'Meridian Health',
    industry: 'Clinical software',
    size: '201-500',
    location: 'Toronto, Canada',
    website: 'https://meridianhealth.example.ca',
    logoText: 'MH',
    blurb:
      'Scheduling and records tooling for outpatient clinics. Regulated environment with real accessibility and audit requirements.',
  },
  {
    id: 'atlas-analytics',
    name: 'Atlas Analytics',
    industry: 'Warehouse and BI tooling',
    size: '51-200',
    location: 'Pune, India',
    website: 'https://atlasanalytics.example.in',
    logoText: 'AA',
    blurb:
      'Atlas builds ELT orchestration and semantic-layer tooling on top of Snowflake and BigQuery. Data engineers talk to customers directly.',
  },
  {
    id: 'rustika-rails',
    name: 'Rustika Rails',
    industry: 'Rail infrastructure software',
    size: '51-200',
    location: 'Hyderabad, India',
    website: 'https://rustikarails.example.in',
    logoText: 'RR',
    blurb:
      'Signalling and asset-management software for rail operators. Long-lived Java services, embedded integrations, and a strong review culture.',
  },
  {
    id: 'lumen-commerce',
    name: 'Lumen Commerce',
    industry: 'Retail commerce platform',
    size: '201-500',
    location: 'London, UK',
    website: 'https://lumencommerce.example.co.uk',
    logoText: 'LC',
    blurb:
      'Storefront and checkout infrastructure for mid-market retailers. Conversion work is measured, not debated.',
  },
];

function recruiter({ id, name, email, title, companyId, location, bio, avatar }) {
  const company = COMPANIES.find((c) => c.id === companyId);
  return {
    id,
    role: 'recruiter',
    name,
    email,
    title,
    companyId,
    companyName: company?.name ?? '',
    headline: `${title} at ${company?.name ?? ''}`,
    location,
    avatar: avatar ?? null,
    bio,
    skills: ['Technical Recruiting', 'Sourcing', 'Interview Design', 'Employer Branding'],
    emailVerified: true,
    visibility: 'public',
    notificationPrefs: {
      connectionRequests: true,
      applicationUpdates: true,
      jobMatches: true,
      recruiterActivity: true,
    },
    createdAt: '2025-03-12T08:00:00.000Z',
  };
}

export const RECRUITERS = [
  recruiter({
    id: 'nathan-boone',
    name: 'Nathan Boone',
    email: 'nathan.boone@devconnect.test',
    title: 'Talent Partner',
    companyId: 'northwind-labs',
    location: 'New York, NY',
    bio: 'I hire platform and backend engineers, and I write down what the interview loop actually measured. Fourteen years in hiring, the last six inside developer tooling companies.',
  }),
  recruiter({
    id: 'imani-wright',
    name: 'Imani Wright',
    email: 'imani.wright@vectorfoundry.example.com',
    title: 'Head of Talent',
    companyId: 'vector-foundry',
    location: 'Austin, TX',
    bio: 'Founding recruiter at Vector Foundry. Building the first twelve-person engineering team around retrieval and evaluation work.',
  }),
  recruiter({
    id: 'sven-lockhart',
    name: 'Sven Lockhart',
    email: 'sven.lockhart@rustikarails.example.in',
    title: 'Engineering Hiring Lead',
    companyId: 'rustika-rails',
    location: 'Hyderabad, India',
    bio: 'Hiring for long-lived systems work — signalling, integrations, and the platform teams underneath them. Runs a structured loop with a written rubric.',
  }),
  recruiter({
    id: 'hana-oyelaran',
    name: 'Hana Oyelaran',
    email: 'hana.oyelaran@brightloom.example.de',
    title: 'Talent Engineer',
    companyId: 'brightloom',
    location: 'Berlin, Germany',
    bio: 'Design-led product company hiring frontend and design-systems engineers. I care about portfolio depth far more than tenure length.',
  }),
  recruiter({
    id: 'marisol-etrade',
    name: 'Marisol Etrade',
    email: 'marisol.etrade@meridianhealth.example.ca',
    title: 'Senior Recruiter, Clinical Product',
    companyId: 'meridian-health',
    location: 'Toronto, Canada',
    bio: 'Recruiting product engineering in a regulated healthcare setting, so accessibility and audit work are part of every req I open.',
  }),
];

export const DEVELOPERS = [
  dev({
    id: 'priya-raman',
    name: 'Priya Raman',
    email: 'priya.raman@devconnect.test',
    headline: 'Senior full-stack engineer · TypeScript, React, Node.js',
    location: 'Bengaluru, India',
    bio: 'I build product surfaces that stay maintainable — typed contracts at the boundary, real tests on the flows that earn money. Six years splitting time between React frontends and Node services, most recently leading the checkout rewrite at a mid-size commerce shop.',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'GraphQL', 'Testing', 'Tailwind CSS', 'Accessibility', 'CI/CD'],
    experienceLevel: 'senior',
    yearsOfExperience: y(6),
    githubUsername: 'priyarman',
    website: 'https://priyarman.example.dev',
    linkedIn: 'in/priyaraman',
    twitter: 'priya_builds',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Bengaluru, India', 'Remote (any timezone)', 'Remote (EU)'],
    minSalary: 3800000,
    roleTypes: ['full-time', 'contract'],
    notifyMatches: true,
    experience: [
      {
        title: 'Senior Software Engineer',
        organization: 'Lumen Commerce',
        startYear: '2023',
        detail: 'Leads the storefront platform group. Rebuilt checkout as a typed Next.js app, cutting aborted-payment sessions by 18% and shaving 900ms off first render.',
      },
      {
        title: 'Software Engineer',
        organization: 'CivicLoop',
        startYear: '2020',
        endYear: '2023',
        detail: 'Built the public dataset explorer used by three municipal agencies; owned the React and Node layers end to end.',
      },
      {
        title: 'Frontend Developer',
        organization: 'Independent consulting',
        startYear: '2019',
        endYear: '2020',
        detail: 'Delivery work for two early-stage teams: design system, marketing site, admin dashboard.',
      },
    ],
    education: [
      { title: 'B.E. Computer Science', organization: 'RV College of Engineering', startYear: '2015', endYear: '2019' },
    ],
  }),
  dev({
    id: 'marcus-adeyemi',
    name: 'Marcus Adeyemi',
    email: 'marcus.adeyemi@example.test',
    headline: 'Backend engineer · Go and distributed systems',
    location: 'Toronto, Canada',
    bio: 'Queue depth, p99 latency, and boring migrations. I have spent four years moving Ruby and Python services onto Go, usually one endpoint at a time so nothing breaks on a Friday.',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'gRPC', 'Kubernetes', 'System Design', 'Redis', 'Observability', 'Linux'],
    experienceLevel: 'senior',
    yearsOfExperience: y(7),
    githubUsername: 'madeyemi',
    linkedIn: 'in/marcusadeyemi',
    openTo: 'new-roles',
    workMode: 'hybrid',
    locationPref: ['Toronto, Canada', 'Remote (North America)'],
    minSalary: 165000,
    experience: [
      { title: 'Senior Backend Engineer', organization: 'Harborstack', startYear: '2022', detail: 'Owns the routing service that schedules dock moves; rewrote the matcher in Go and cut median route computation from 420ms to 61ms.' },
      { title: 'Backend Engineer', organization: 'Meridian Health', startYear: '2019', endYear: '2022', detail: 'Scheduling API work, HL7/FHIR integration, and the audit trail that passed two compliance reviews.' },
    ],
    education: [{ title: 'M.Sc. Software Engineering', organization: 'University of Toronto', startYear: '2017', endYear: '2019' }],
  }),
  dev({
    id: 'elena-sorensen',
    name: 'Elena Sorensen',
    email: 'elena.sorensen@example.test',
    headline: 'Staff frontend engineer · React, design systems, performance',
    location: 'Berlin, Germany',
    bio: 'I work at the seam between design and engineering: token systems, rendering budgets, and interfaces that survive contact with real content. German/English, and happy to review in either.',
    skills: ['React', 'TypeScript', 'Design Systems', 'CSS', 'Web Performance', 'Accessibility', 'Figma', 'Testing', 'Vite'],
    experienceLevel: 'lead',
    yearsOfExperience: y(9),
    githubUsername: 'elenasorensen',
    website: 'https://sorensen.works',
    linkedIn: 'in/elenasorensen',
    openTo: 'leadership-roles',
    workMode: 'hybrid',
    locationPref: ['Berlin, Germany', 'Remote (EU)'],
    minSalary: 105000,
    experience: [
      { title: 'Staff Frontend Engineer', organization: 'Brightloom', startYear: '2021', detail: 'Owns the canvas component library used by the whole product; introduced a rendering budget enforced in CI.' },
      { title: 'Senior Frontend Engineer', organization: 'Lumen Commerce', startYear: '2017', endYear: '2021', detail: 'Rebuilt the design system onto 42 primitives and removed 11k lines of one-off CSS.' },
    ],
    education: [{ title: 'MFA Interaction Design', organization: 'UWE Bristol', startYear: '2014', endYear: '2016' }],
  }),
  dev({
    id: 'tobias-keller',
    name: 'Tobias Keller',
    email: 'tobias.keller@example.test',
    headline: 'Platform engineer · Kubernetes, Terraform, Go',
    location: 'Zurich, Switzerland',
    bio: 'Infrastructure as an internal product: I build the paved road other teams deploy onto. Two migrations of our Kubernetes estate, and I wrote the incident runbooks people actually use.',
    skills: ['Kubernetes', 'Terraform', 'Go', 'AWS', 'Observability', 'Prometheus', 'Grafana', 'Linux', 'CI/CD', 'Security'],
    experienceLevel: 'senior',
    yearsOfExperience: y(8),
    githubUsername: 'tkeller',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Zurich, Switzerland'],
    minSalary: 130000,
    experience: [
      { title: 'Platform Engineer', organization: 'Northwind Labs', startYear: '2021', detail: 'Cut median deploy time from 14 minutes to 3.5 by replacing bespoke scripts with a Terraform module and Argo pipelines.' },
      { title: 'DevOps Engineer', organization: 'Harborstack', startYear: '2018', endYear: '2021', detail: 'On-prem and cloud parity work for freight customers who refuse to depend on the public internet.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'ETH Zürich', startYear: '2012', endYear: '2016' }],
  }),
  dev({
    id: 'diego-marchant',
    name: 'Diego Marchant',
    email: 'diego.marchant@example.test',
    headline: 'Full-stack engineer · Node.js and React',
    location: 'Lisbon, Portugal',
    bio: 'Products from empty repo to first paying customer. Comfortable owning a feature across the schema, the API, and the UI without a handover doc.',
    skills: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Prisma', 'REST APIs', 'AWS', 'Testing'],
    experienceLevel: 'mid',
    yearsOfExperience: y(4),
    githubUsername: 'dmarchant',
    linkedIn: 'in/diegomarchant',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Lisbon, Portugal'],
    minSalary: 62000,
    experience: [
      { title: 'Full-stack Engineer', organization: 'Atlas Analytics', startYear: '2022', detail: 'Built the orchestration console and the run-history API behind it.' },
      { title: 'Software Engineer', organization: 'Freelance', startYear: '2020', endYear: '2022', detail: 'Twelve shipped projects, mostly admin panels and booking flows.' },
    ],
    education: [{ title: 'BSc Software Engineering', organization: 'University of Coimbra', startYear: '2016', endYear: '2020' }],
  }),
  dev({
    id: 'aiko-tanaka',
    name: 'Aiko Tanaka',
    email: 'aiko.tanaka@example.test',
    headline: 'Security engineer · AppSec and threat modelling',
    location: 'Tokyo, Japan',
    bio: 'I find the injection before your customer does. Ten years split between offensive work and building the guardrails so the same class of bug cannot ship twice.',
    skills: ['Security', 'Threat Modeling', 'OAuth', 'Node.js', 'Python', 'Linux', 'Observability', 'Technical Writing'],
    experienceLevel: 'senior',
    yearsOfExperience: y(10),
    githubUsername: 'aiko-t',
    openTo: 'not-looking',
    workMode: 'hybrid',
    locationPref: ['Tokyo, Japan'],
    experience: [
      { title: 'Senior AppSec Engineer', organization: 'Helios Financial', startYear: '2020', detail: 'Runs the secure-SDLC programme; killed an entire class of SSRF findings with one library and a lint rule.' },
      { title: 'Security Consultant', organization: 'Independent', startYear: '2016', endYear: '2020', detail: 'Assessments across fintech and healthcare, including two regulated pen tests per year.' },
    ],
    education: [{ title: 'BSc Information Security', organization: 'Waseda University', startYear: '2010', endYear: '2014' }],
  }),
  dev({
    id: 'ruben-oster',
    name: 'Ruben Oster',
    email: 'ruben.oster@example.test',
    headline: 'Senior backend engineer · Java and Spring Boot',
    location: 'Amsterdam, Netherlands',
    bio: 'Long-lived enterprise services. I like clear module boundaries, migrations that can be rolled back, and tests that describe the business rule rather than the implementation.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Microservices', 'System Design', 'Testing', 'Kubernetes'],
    experienceLevel: 'senior',
    yearsOfExperience: y(11),
    githubUsername: 'roster',
    linkedIn: 'in/rubenoster',
    openTo: 'new-roles',
    workMode: 'hybrid',
    locationPref: ['Amsterdam, Netherlands', 'Rotterdam, Netherlands'],
    minSalary: 88000,
    experience: [
      { title: 'Senior Backend Engineer', organization: 'Harborstack', startYear: '2019', detail: 'Owns the berth-allocation domain; led the extraction of three modules from an 18-year-old monolith.' },
      { title: 'Backend Engineer', organization: 'Lumen Commerce', startYear: '2015', endYear: '2019', detail: 'Pricing and promotions engine, Black Friday scale.' },
    ],
    education: [{ title: 'MSc Computer Science', organization: 'TU Delft', startYear: '2011', endYear: '2015' }],
  }),
  dev({
    id: 'sara-bennani',
    name: 'Sara Bennani',
    email: 'sara.bennani@example.test',
    headline: 'ML engineer · Retrieval, evaluation, and LLM pipelines',
    location: 'Paris, France',
    bio: 'I make LLM features measurable: eval harnesses, retrieval quality, and the boring data plumbing underneath. Suspicious of any demo that has no offline metrics.',
    skills: ['Python', 'Machine Learning', 'LLM Integration', 'Vector Search', 'PyTorch', 'FastAPI', 'SQL', 'Observability'],
    experienceLevel: 'senior',
    yearsOfExperience: y(6),
    githubUsername: 'sarabennani',
    website: 'https://bennani.ml',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Paris, France'],
    minSalary: 92000,
    experience: [
      { title: 'ML Engineer', organization: 'Vector Foundry', startYear: '2023', detail: 'Built the evaluation runner and the retrieval benchmark suite the sales team demos.' },
      { title: 'Data Scientist', organization: 'Atlas Analytics', startYear: '2019', endYear: '2023', detail: 'Demand forecasting for retail customers, then the internal feature store that replaced it.' },
    ],
    education: [{ title: 'MSc Machine Learning', organization: 'Université Paris-Saclay', startYear: '2016', endYear: '2019' }],
  }),
  dev({
    id: 'kwabena-mensah',
    name: 'Kwabena Mensah',
    email: 'kwabena.mensah@example.test',
    headline: 'iOS engineer · Swift and SwiftUI',
    location: 'Accra, Ghana',
    bio: 'Native iOS with an eye on offline-first sync. Two apps on the App Store that work in places where the network drops every ninety seconds.',
    skills: ['iOS', 'Swift', 'Mobile', 'REST APIs', 'Testing', 'Accessibility', 'Firebase'],
    experienceLevel: 'mid',
    yearsOfExperience: y(5),
    githubUsername: 'kmensah',
    linkedIn: 'in/kwabename',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (any timezone)', 'Accra, Ghana'],
    minSalary: 55000,
    experience: [
      { title: 'iOS Engineer', organization: 'Meridian Health', startYear: '2022', detail: 'Shipped the clinician-facing scheduling app; offline queue survives eight-hour shifts without connectivity.' },
      { title: 'Mobile Developer', organization: 'Hubtel', startYear: '2020', endYear: '2022', detail: 'Payments and agent tooling for merchants on feature phones.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'University of Ghana', startYear: '2015', endYear: '2019' }],
  }),
  dev({
    id: 'ingrid-halvorsen',
    name: 'Ingrid Halvorsen',
    email: 'ingrid.halvorsen@example.test',
    headline: 'Data engineer · Spark, Airflow, warehouse modelling',
    location: 'Oslo, Norway',
    bio: 'I own the pipeline between raw events and the table somebody forecasts from. Schema contracts, backfills that do not take the cluster down, and cost-per-query nobody argues about.',
    skills: ['Python', 'Apache Spark', 'Airflow', 'dbt', 'ETL', 'SQL', 'Data Modeling', 'AWS', 'ClickHouse'],
    experienceLevel: 'senior',
    yearsOfExperience: y(8),
    githubUsername: 'ihalvorsen',
    openTo: 'contract-work',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Oslo, Norway'],
    minSalary: 95000,
    experience: [
      { title: 'Senior Data Engineer', organization: 'Atlas Analytics', startYear: '2021', detail: 'Re-platformed ingestion onto Spark with schema contracts; cut nightly run time from 6h to 47min.' },
      { title: 'Data Engineer', organization: 'Lumen Commerce', startYear: '2018', endYear: '2021', detail: 'Built the orders warehouse model still in use.' },
    ],
    education: [{ title: 'MSc Data Science', organization: 'University of Oslo', startYear: '2014', endYear: '2016' }],
  }),
  dev({
    id: 'felipe-castro',
    name: 'Felipe Castro',
    email: 'felipe.castro@example.test',
    headline: 'Junior full-stack developer · React and Node.js',
    location: 'São Paulo, Brazil',
    bio: 'Career switcher: four years in civil engineering, now building web software full time. I finish things, ask precise questions, and keep a public log of what I did not understand last week.',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'PostgreSQL', 'Testing'],
    experienceLevel: 'junior',
    yearsOfExperience: y(1),
    githubUsername: 'fcastro-dev',
    openTo: 'first-roles',
    workMode: 'remote',
    locationPref: ['São Paulo, Brazil', 'Remote (Americas)'],
    minSalary: 42000,
    experience: [
      { title: 'Junior Developer', organization: 'CivicLoop', startYear: '2025', detail: 'Contract-to-hire on the dataset explorer. Shipped the CSV export and its tests.' },
      { title: 'Civil Engineer', organization: 'Odebrecht', startYear: '2021', endYear: '2024', detail: 'Automation scripts for site reporting, which is how I got here.' },
    ],
    education: [
      { title: 'BEng Civil Engineering', organization: 'USP', startYear: '2016', endYear: '2021' },
      { title: 'Full-stack Bootcamp', organization: 'Trybe', startYear: '2024', endYear: '2025' },
    ],
  }),
  dev({
    id: 'nadia-belkacem',
    name: 'Nadia Belkacem',
    email: 'nadia.belkacem@example.test',
    headline: 'Frontend engineer · Vue and React, design-system focused',
    location: 'Casablanca, Morocco',
    bio: 'I take a Figma file to production without the spacing drifting. Strong on component API design, and I write the docs nobody else wants to.',
    skills: ['Vue', 'React', 'JavaScript', 'TypeScript', 'CSS', 'Design Systems', 'Figma', 'Accessibility'],
    experienceLevel: 'mid',
    yearsOfExperience: y(4),
    githubUsername: 'nadiabk',
    linkedIn: 'in/nadiabelkacem',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Casablanca, Morocco'],
    minSalary: 45000,
    experience: [
      { title: 'Frontend Engineer', organization: 'Brightloom', startYear: '2023', detail: 'Owns form primitives and the token pipeline between Figma variables and CSS custom properties.' },
      { title: 'Frontend Developer', organization: 'Maroc Learn', startYear: '2021', endYear: '2023', detail: 'Vue 3 rewrite of the learner dashboard; RTL support for Arabic content.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'ENSIAS', startYear: '2017', endYear: '2021' }],
  }),
  dev({
    id: 'victor-olaru',
    name: 'Victor Olaru',
    email: 'victor.olaru@example.test',
    headline: 'Engineering manager · TypeScript teams, delivery focus',
    location: 'Bucharest, Romania',
    bio: 'Six years writing software, four running a team of seven. I stay technical — reviews, design docs, and the occasional migration — but my output is other people shipping.',
    skills: ['TypeScript', 'Node.js', 'System Design', 'Agile', 'Mentoring', 'React', 'PostgreSQL', 'Technical Writing'],
    experienceLevel: 'lead',
    yearsOfExperience: y(10),
    githubUsername: 'volaru',
    linkedIn: 'in/victorolaru',
    openTo: 'leadership-roles',
    workMode: 'hybrid',
    locationPref: ['Bucharest, Romania', 'Remote (EU)'],
    minSalary: 98000,
    experience: [
      { title: 'Engineering Manager', organization: 'Atlas Analytics', startYear: '2022', detail: 'Product ingest team of seven. Two promotions, zero unplanned outages on our services.' },
      { title: 'Senior Engineer', organization: 'Northwind Labs', startYear: '2018', endYear: '2022', detail: 'Query API and the public SDK.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'University of Bucharest', startYear: '2011', endYear: '2015' }],
  }),
  dev({
    id: 'hanaa-elsayed',
    name: 'Hanaa Elsayed',
    email: 'hanaa.elsayed@example.test',
    headline: 'Backend engineer · Python, FastAPI, data platforms',
    location: 'Cairo, Egypt',
    bio: 'APIs that hold up under load and stay documented. Most of my work is on the boundary between data engineering and product: feature stores, orchestration, ingestion.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS', 'ETL', 'Testing'],
    experienceLevel: 'mid',
    yearsOfExperience: y(5),
    githubUsername: 'hanaaes',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Cairo, Egypt', 'Remote (any timezone)'],
    minSalary: 48000,
    experience: [
      { title: 'Backend Engineer', organization: 'Atlas Analytics', startYear: '2022', detail: 'Owns the connector framework; added retry semantics that stopped silent data loss.' },
      { title: 'Software Engineer', organization: 'Instashop', startYear: '2020', endYear: '2022', detail: 'Catalog and inventory APIs for 400+ retailers.' },
    ],
    education: [{ title: 'BSc Information Systems', organization: 'Cairo University', startYear: '2016', endYear: '2020' }],
  }),
  dev({
    id: 'lukas-brandt',
    name: 'Lukas Brandt',
    email: 'lukas.brandt@example.test',
    headline: 'Systems engineer · Rust and embedded-adjacent services',
    location: 'Munich, Germany',
    bio: 'Rust for the parts where a panic is unacceptable. I come from automotive tooling and now work on ingest paths where backpressure has to be a design decision, not a surprise.',
    skills: ['Rust', 'Linux', 'System Design', 'C++', 'Observability', 'gRPC', 'Performance Optimization'],
    experienceLevel: 'senior',
    yearsOfExperience: y(7),
    githubUsername: 'lbrandt',
    openTo: 'new-roles',
    workMode: 'onsite',
    locationPref: ['Munich, Germany'],
    minSalary: 96000,
    experience: [
      { title: 'Systems Engineer', organization: 'Northwind Labs', startYear: '2023', detail: 'Rewrote the collector hot path in Rust; 3.4x throughput at the same CPU ceiling.' },
      { title: 'Software Engineer', organization: 'Continental', startYear: '2019', endYear: '2023', detail: 'HIL test tooling and C++ services on constrained hardware.' },
    ],
    education: [{ title: 'Diploma Computer Engineering', organization: 'TU München', startYear: '2012', endYear: '2018' }],
  }),
  dev({
    id: 'grace-ombata',
    name: 'Grace Ombata',
    email: 'grace.ombata@example.test',
    headline: 'Product engineer · React Native and TypeScript',
    location: 'Nairobi, Kenya',
    bio: 'Mobile products for markets where the device is three years old and the connection is worse. I profile on cheap Android before I call a feature done.',
    skills: ['React Native', 'TypeScript', 'React', 'Mobile', 'REST APIs', 'Testing', 'Firebase'],
    experienceLevel: 'mid',
    yearsOfExperience: y(5),
    githubUsername: 'graceombata',
    linkedIn: 'in/graceombata',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Nairobi, Kenya', 'Remote (any timezone)'],
    minSalary: 52000,
    experience: [
      { title: 'Product Engineer', organization: 'Hubtel', startYear: '2022', detail: 'Merchant app rewrite; startup time down to 1.1s on a Gojra 4G.' },
      { title: 'Mobile Engineer', organization: 'M-KOPA', startYear: '2020', endYear: '2022', detail: 'Device financing flows and USSD fallback paths.' },
    ],
    education: [{ title: 'BSc Software Development', organization: 'Strathmore University', startYear: '2015', endYear: '2019' }],
  }),
  dev({
    id: 'samuel-okonkwo',
    name: 'Samuel Okonkwo',
    email: 'samuel.okonkwo@example.test',
    headline: 'Site reliability engineer · AWS, Terraform, incident response',
    location: 'Lagos, Nigeria',
    bio: 'I carry the pager and then fix the reason I had to. Blameless reviews, error budgets with teeth, and dashboards that answer the question before someone asks it.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Linux', 'Observability', 'CI/CD', 'Python'],
    experienceLevel: 'senior',
    yearsOfExperience: y(6),
    githubUsername: 'som-k8s',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (any timezone)', 'Lagos, Nigeria'],
    minSalary: 74000,
    experience: [
      { title: 'SRE Lead', organization: 'Vector Foundry', startYear: '2023', detail: 'Built the on-call programme from nothing; MTTR down from 3h to 26min across two quarters.' },
      { title: 'SRE', organization: 'Instashop', startYear: '2020', endYear: '2023', detail: 'Migrated a 40-service estate onto EKS with zero customer-visible downtime.' },
    ],
    education: [{ title: 'BSc Computer Engineering', organization: 'University of Lagos', startYear: '2013', endYear: '2017' }],
  }),
  dev({
    id: 'wei-zhang',
    name: 'Wei Zhang',
    email: 'wei.zhang@example.test',
    headline: 'Staff backend engineer · Distributed systems, Go and Elixir',
    location: 'Singapore',
    bio: 'Correctness under partition. I have built ledgers, schedulers, and the reconciliation jobs that quietly keep two systems agreeing.',
    skills: ['Go', 'Elixir', 'PostgreSQL', 'Kafka', 'System Design', 'Microservices', 'Redis', 'Testing'],
    experienceLevel: 'principal',
    yearsOfExperience: y(12),
    githubUsername: 'wzhang',
    openTo: 'advisory',
    workMode: 'remote',
    locationPref: ['Singapore', 'Remote (APAC)'],
    minSalary: 210000,
    experience: [
      { title: 'Staff Engineer', organization: 'Helios Financial', startYear: '2021', detail: 'Owns the double-entry ledger core and the migration off the legacy .NET money movement path.' },
      { title: 'Senior Engineer', organization: 'Grab', startYear: '2016', endYear: '2021', detail: 'Payments routing and marketplace pricing services.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'NUS', startYear: '2008', endYear: '2012' }],
  }),
  dev({
    id: 'clara-mendes',
    name: 'Clara Mendes',
    email: 'clara.mendes@example.test',
    headline: 'Design engineer · Figma to production, Svelte and React',
    location: 'Porto, Portugal',
    bio: 'I write the CSS and the component that goes with it. Best used on the surfaces customers see, not on internal CRUD.',
    skills: ['Svelte', 'React', 'CSS', 'Figma', 'Design Systems', 'TypeScript', 'Web Performance', 'HTML'],
    experienceLevel: 'mid',
    yearsOfExperience: y(4),
    githubUsername: 'claramendes',
    website: 'https://clara.design',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Porto, Portugal'],
    minSalary: 54000,
    experience: [
      { title: 'Design Engineer', organization: 'Brightloom', startYear: '2023', detail: 'Owns the review-mode interaction layer; wrote the motion guidelines now in the design system.' },
      { title: 'UI Developer', organization: 'Independent studio', startYear: '2021', endYear: '2023', detail: 'Twenty-odd brand sites, all hand-built without a page builder.' },
    ],
    education: [{ title: 'BA Communication Design', organization: 'Universidade do Porto', startYear: '2017', endYear: '2021' }],
  }),
  dev({
    id: 'omid-rashidi',
    name: 'Omid Rashidi',
    email: 'omid.rashidi@example.test',
    headline: 'Backend engineer · Node.js, event-driven systems',
    location: 'Vancouver, Canada',
    bio: 'Event schemas, idempotency, and the consumer that has to retry at 3am. I work best where the message volume is high enough to expose the design.',
    skills: ['Node.js', 'Kafka', 'TypeScript', 'MongoDB', 'Redis', 'Microservices', 'REST APIs', 'Testing'],
    experienceLevel: 'mid',
    yearsOfExperience: y(5),
    githubUsername: 'omidr',
    linkedIn: 'in/omidas',
    openTo: 'new-roles',
    workMode: 'hybrid',
    locationPref: ['Vancouver, Canada', 'Remote (North America)'],
    minSalary: 128000,
    experience: [
      { title: 'Backend Engineer', organization: 'Lumen Commerce', startYear: '2022', detail: 'Event pipeline for inventory; dedupe and replay tooling that made incident review survivable.' },
      { title: 'Software Developer', organization: 'Clio', startYear: '2020', endYear: '2022', detail: 'Billing integrations and the retry model underneath them.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'SFU', startYear: '2016', endYear: '2020' }],
  }),
  dev({
    id: 'julia-nowak',
    name: 'Julia Nowak',
    email: 'julia.nowak@example.test',
    headline: 'QA and release engineer · Playwright, CI, test strategy',
    location: 'Krakow, Poland',
    bio: 'I make releases boring. Test strategy over test count, flake budgets enforced in CI, and a release checklist a new engineer can run alone.',
    skills: ['Playwright', 'Testing', 'CI/CD', 'TypeScript', 'JavaScript', 'GitHub Actions', 'Observability', 'Technical Writing'],
    experienceLevel: 'senior',
    yearsOfExperience: y(7),
    githubUsername: 'jnowak',
    openTo: 'new-roles',
    workMode: 'remote',
    locationPref: ['Remote (EU)', 'Krakow, Poland'],
    minSalary: 78000,
    experience: [
      { title: 'Release Engineer', organization: 'Northwind Labs', startYear: '2022', detail: 'Cut CI wall time from 34min to 9; owns the canary policy for the SaaS rollout.' },
      { title: 'QA Engineer', organization: 'Lumen Commerce', startYear: '2019', endYear: '2022', detail: 'Built the end-to-end suite covering checkout, 214 specs at 99.2% pass rate.' },
    ],
    education: [{ title: 'BSc Software Engineering', organization: 'AGH Krakow', startYear: '2014', endYear: '2018' }],
  }),
];

/**
 * The review account. One identity that carries both workspaces: a complete developer
 * profile (so matches, applications and the network screens are populated) and ownership
 * of its own postings (so the recruiter pipeline is populated too). Deliberately finished
 * rather than half-edited, so it demonstrates the product at its fullest state and the
 * two primary personas keep demonstrating the partial-profile paths.
 */
export const SUPERUSER = {
  ...dev({
    id: 'avery-sandoval',
    role: 'superuser',
    name: 'Avery Sandoval',
    email: 'avery.sandoval@devconnect.test',
    headline: 'Staff Engineer & Hiring Lead at Meridian Health',
    location: 'Toronto, Canada',
    bio: 'I write the scheduling engine some mornings and read candidate loops the same afternoon. Both halves of this product are on my desk, which makes me the least typical user and the best one to review it with.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Testing', 'Accessibility', 'Technical Interviewing'],
    experienceLevel: 'senior',
    yearsOfExperience: 11,
    githubUsername: 'averysandoval',
    website: 'https://averysandoval.example.ca',
    linkedIn: 'in/averysandoval',
    workMode: 'hybrid',
    locationPref: ['Toronto, Canada', 'Remote (US/EU)'],
    minSalary: 165000,
    experience: [
      { title: 'Staff Engineer & Hiring Lead', organization: 'Meridian Health', startYear: '2021', detail: 'Owns the appointment scheduling engine and runs the senior engineering loop for it.' },
      { title: 'Senior Product Engineer', organization: 'CivicLoop', startYear: '2016', endYear: '2021', detail: 'Built the export layer and the accessibility programme that got the filings past a WCAG audit.' },
    ],
    education: [{ title: 'BSc Computer Science', organization: 'University of Toronto', startYear: '2009', endYear: '2013' }],
  }),
  title: 'Staff Engineer & Hiring Lead',
  companyId: 'meridian-health',
  companyName: 'Meridian Health',
};

/** Everyone in one list; role is the discriminator. */
export const USERS = [...DEVELOPERS, ...RECRUITERS, SUPERUSER];

/** Demo logins for the simulated auth layer. Passwords are identical by design and
 *  documented on the login screen — this is not a security mechanism. */
export const DEMO_CREDENTIALS = [
  {
    label: 'Superuser',
    email: 'avery.sandoval@devconnect.test',
    password: 'demo1234',
    userId: 'avery-sandoval',
    note: 'Every screen in both workspaces, with a finished profile and its own applicant pipeline.',
  },
  {
    label: 'Developer',
    email: 'priya.raman@devconnect.test',
    password: 'demo1234',
    userId: 'priya-raman',
    note: 'Six live applications, ten connections, four pending requests, a half-finished profile.',
  },
  {
    label: 'Recruiter',
    email: 'nathan.boone@devconnect.test',
    password: 'demo1234',
    userId: 'nathan-boone',
    note: 'Three job postings, an applicant pipeline with every status represented.',
  },
];

export const DEMO_PASSWORD = 'demo1234';

/** Any seeded account can also sign in with the same demo password. */
export const ALL_DEMO_EMAILS = USERS.map((u) => u.email);
