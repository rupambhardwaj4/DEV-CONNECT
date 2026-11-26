# -*- coding: utf-8 -*-
# Chapter content; imports part 1 (front matter + helpers) then saves the document.
import os
from build_report import (doc, P, C, add_figure, add_table, table_caption, bullet,
                          set_margins, set_pgnum, footer_pagenum, WD_SECTION,
                          WD_ALIGN_PARAGRAPH, Inches, FIG, SHOTS, ROOT, OUT)

# ================= MAIN BODY SECTION (arabic numbering) =================
s2 = doc.add_section(WD_SECTION.NEW_PAGE)
set_margins(s2)
set_pgnum(s2, 'decimal', 1)
footer_pagenum(s2)

# ---------------- CHAPTER 1 ----------------
doc.add_heading('CHAPTER 1: INTRODUCTION', level=1)

doc.add_heading('1.1 Background of the Study', level=2)
P('Professional networking and recruitment increasingly depend on digital profiles, searchable skill '
  'information, project portfolios and online job workflows. For software developers, a conventional '
  'resume may not fully communicate practical evidence such as repository activity, programming '
  'languages and shipped projects. Recruiters, meanwhile, need a consistent way to publish roles, '
  'inspect relevant candidate information and manage applications. Separate tools for networking, code '
  'portfolios, job discovery and application tracking fragment the experience and force repeated manual '
  'effort.')
P('DevConnect is a responsive full-stack web application that combines developer profiles, GitHub '
  'integration, professional networking, community activity, recruitment workflows and advisory '
  'AI-assisted job matching. The client is built with React 19, Vite and Tailwind CSS; the server is a '
  'versioned REST API built with Node.js and Express 5; PostgreSQL is the persistent data store, managed '
  'through Prisma migrations. GitHub integration retrieves permitted public profile and repository '
  'metadata server-side so that provider tokens are never exposed to the browser. Job matching is '
  'performed by a transparent deterministic scoring engine with human-readable explanations.')

doc.add_heading('1.2 Problem Statement', level=2)
P('Developers and recruiters interact across disconnected professional profiles, code-hosting services, '
  'job boards and application tools. This fragmentation makes it harder for candidates to present '
  'project evidence in context and for recruiters to connect job requirements with relevant skills and '
  'experience. Search results typically provide limited explanation of why a role is relevant, and '
  'opaque AI ranking in recruitment raises fairness and privacy concerns. There is a need for a unified, '
  'role-aware platform that links developer profiles and permitted GitHub metadata with networking, job '
  'publication, applications and explainable job recommendations, while enforcing authorization '
  'boundaries and never automating hiring decisions.')

doc.add_heading('1.3 Objectives of the Study', level=2)
for t in [
 'To design a responsive React-based interface covering developer profiles, networking, community interaction, job discovery and recruitment workflows.',
 'To implement a Node.js/Express REST API with authentication, role-based authorization, input validation and PostgreSQL persistence managed through Prisma migrations.',
 'To provide a consent-based GitHub connection flow that retrieves permitted public profile and repository metadata without exposing provider tokens to the browser.',
 'To support job publication, faceted job search, application submission, application-status tracking and recruiter review while enforcing ownership and duplicate-application rules.',
 'To develop an explainable job-matching baseline using profile and job attributes with deterministic weights, producing human-readable match reasons.',
 'To verify critical user journeys, access-control boundaries, integration failure handling and responsive behaviour through a documented test plan.'
]:
    bullet(t)

doc.add_heading('1.4 Scope of the Project', level=2)
P('The delivered scope comprises the responsive web interface and REST API; registration, '
  'authentication, role-based authorization and profile management; GitHub repository import with '
  'user-controlled pinning; developer discovery, connection requests and notifications; job '
  'publication with draft/published/closed states, search, saving, applications and applicant pipeline '
  'workflows; explainable deterministic job matching; activity tracking; and deployment preparation.')
P('The initial release excludes native iOS/Android applications, payroll, background checks, formal '
  'employment contracts, external HR-suite integrations, automated hiring or automatic rejection, '
  'private GitHub repository access, real-time video interviews, live coding environments, direct '
  'messaging, guaranteed identity or skill verification, enterprise single sign-on and formal compliance '
  'certification.')

doc.add_heading('1.5 Organization of the Report', level=2)
P('Chapter 2 reviews related work on job recommender systems and explainable recommendation, presents a '
  'comparative analysis and identifies the gaps DevConnect addresses. Chapter 3 analyses the existing '
  'and proposed systems and studies technical, economic and operational feasibility. Chapter 4 presents '
  'the system design: use-case view, data flow diagrams, logical architecture, component/class overview, '
  'activity diagram and database design. Chapter 5 documents the tools and technologies, implementation '
  'details, API surface, test cases and results with snapshots of every major screen. Chapter 6 states '
  'the conclusions and future scope. References follow the IEEE format, and the appendices contain the '
  'complete table structures and additional screenshots.')

# ---------------- CHAPTER 2 ----------------
doc.add_heading('CHAPTER 2: LITERATURE REVIEW', level=1)

doc.add_heading('2.1 Review of Existing Work', level=2)
P('Research on job recommender systems describes content-based, collaborative, hybrid, knowledge-based '
  'and context-aware approaches. Ertugrul and Bitirim\u2019s systematic review of 57 solution papers '
  'categorizes job-recommendation methods and evaluation measures and notes continuing challenges such '
  'as bias, efficiency and the lack of coverage beyond candidate-job matching [1]. This supports '
  'evaluating the recommendation workflow with more than a single accuracy measure and documenting the '
  'factors used for ranking.')
P('Zhang and Chen\u2019s survey of explainable recommendation shows that explanation quality varies '
  'strongly with the data source and algorithm and must be deliberately designed [2]. A 2023 IEEE '
  'conference survey of AI-based job recommendation systems identifies sparse data, privacy, bias, '
  'transparency and interpretability as open issues [3]. The 2025 systematic review by Zhang et al. on '
  'explainable person-job recommendations emphasizes traceability and the trade-off between performance '
  'and explainability [4]. Collectively, this literature indicates that a recruitment platform should '
  'treat recommendations as advisory, ground every displayed reason in visible profile and job fields, '
  'and make missing information explicit rather than inferred.')
P('Commercially, LinkedIn provides professional networking, GitHub provides code hosting and profile '
  'evidence, and job boards such as Indeed and Naukri provide listings, but each addresses only one '
  'facet of the developer hiring journey. None links repository evidence, networking and application '
  'tracking inside one explainable, role-aware open workflow.')

doc.add_heading('2.2 Comparative Analysis', level=2)
table_caption('Table 2.1: Literature Comparison and Critical Gap Analysis')
add_table([
 ['Ref.', 'Work / System', 'Methodology / Stack', 'Key Limitations', 'DevConnect Advantage'],
 ['[1]', 'Celik Ertugrul & Bitirim (2025)', 'Systematic review of job recommender systems', 'Methods and evaluation vary; bias and efficiency remain open', 'Role-aware recruitment workflow with documented, explainable matching'],
 ['[2]', 'Zhang & Chen (2020)', 'Survey of explainable recommendation', 'Explanation quality depends on data and algorithm', 'Human-readable reasons grounded in profile and job fields'],
 ['[3]', 'IEEE ICSCDS survey (2023)', 'AI-based job recommendation techniques', 'Sparse data, privacy, bias, transparency issues', 'Limited relevant features, privacy-aware access, deterministic fallback, advisory-only scores'],
 ['[4]', 'Zhang et al. (2025)', 'Explainable person-job recommendation review', 'Traceability vs performance trade-offs', 'Explanations and missing-data indicators designed into the workflow'],
 ['-', 'LinkedIn / GitHub / job boards', 'Commercial siloed platforms', 'Fragmented identity, evidence and application data', 'One platform linking profiles, repository context, networking and applications'],
], widths=[0.5, 1.35, 1.35, 1.5, 1.5], font_size=10)

doc.add_heading('2.3 Gap Identification', level=2)
for t in [
 'Interpretability: recommendation methods are difficult to interpret; DevConnect therefore uses a transparent weighted scoring baseline whose every reason is traceable to visible data.',
 'Sparse data: candidate and job data are often incomplete; the platform indicates missing information explicitly and never invents qualifications.',
 'Fairness and privacy: protected or sensitive traits must not be ranking factors, and no component automatically selects or rejects candidates; AI support is advisory only.',
 'Integration: professional identity, GitHub evidence, networking and application workflows are served by separate services; DevConnect\u2019s contribution is their integration inside one role-aware web platform with enforced authorization boundaries.'
]:
    bullet(t)

# ---------------- CHAPTER 3 ----------------
doc.add_heading('CHAPTER 3: SYSTEM ANALYSIS AND FEASIBILITY STUDY', level=1)

doc.add_heading('3.1 Existing System', level=2)
P('In the current practice a developer maintains a static resume, a professional social profile and a '
  'code-hosting account separately. Job hunting happens on external boards, applications are tracked in '
  'spreadsheets or mail folders, and recruiters screen PDF resumes without any structured view of '
  'practical project evidence. Matching is keyword-based and unexplained; candidates receive little '
  'visibility into application status, and recruiters re-key candidate data across tools. This causes '
  'context switching, stale information, duplicate effort and opaque shortlisting decisions.')

doc.add_heading('3.2 Proposed System', level=2)
P('DevConnect replaces this fragmented workflow with a single platform in which each user holds one '
  'role-aware workspace. The main modules are:')
for t in [
 'Identity & Profiles: registration, email verification, JWT session cookies, bcrypt password hashing, profile editor with skills, experience, education, projects, preferences and visibility control.',
 'GitHub Integration: consent-based server-side import of public repositories with stars, languages, topics and contribution history; repositories can be pinned and featured; disconnect removes imported data.',
 'Networking: developer directory with filters, connection requests with messages, accept/decline/remove actions and a two-way connection graph.',
 'Recruitment: recruiter job postings with draft/published/closed states, faceted job board, job saving, applications with cover notes, stage pipeline (applied, under review, interview, offer, rejected, withdrawn) and interview scheduling.',
 'Explainable Matching: deterministic score built from required skills (60%), preferred skills (15%), experience level (15%) and work-mode fit (10%), presented with banded labels and per-job reasons.',
 'Notifications & Activity: inbox grouped by kind, read/delete actions and a profile activity feed showing profile views and connection events.'
]:
    bullet(t)
table_caption('Table 3.1: Existing System versus Proposed System')
add_table([
 ['Aspect', 'Existing System', 'Proposed DevConnect System'],
 ['Professional evidence', 'Static resume, separate GitHub account', 'Profile plus imported repository metrics in one place'],
 ['Application tracking', 'Email threads and spreadsheets', 'Stage pipeline with timeline and recruiter notes'],
 ['Matching', 'Keyword search, no reasons', 'Deterministic scored matches with explanations'],
 ['Recruiter workflow', 'Re-keying across tools', 'Postings, applicant review and shortlisting in one workspace'],
 ['Privacy control', 'None over shared data', 'Visibility settings, consented GitHub access, disconnect support'],
], widths=[1.4, 2.1, 2.2], font_size=10)

doc.add_heading('3.3 Feasibility Study', level=2)
doc.add_heading('3.3.1 Technical Feasibility', level=3)
P('All selected technologies are mature, documented and free: React 19 with Vite, Tailwind CSS, Node.js '
  'with Express 5, PostgreSQL with Prisma ORM, JWT and bcrypt. The team already possesses frontend '
  'and JavaScript skills, and the architecture avoids exotic infrastructure: no GPU, no message broker '
  'and no container orchestration is required for the delivered scope. The GitHub REST API is public and '
  'rate-limited but sufficient for student-scale use. The system runs on an ordinary laptop with 16 GB '
  'RAM, and the API test suite (123 checks) passes locally, confirming technical feasibility.')
doc.add_heading('3.3.2 Economic Feasibility', level=3)
P('The project uses only open-source tooling and free service tiers; development cost is limited to '
  'student time on existing hardware. Hosting a demonstration deployment on entry-level cloud services '
  'is inexpensive, and no licence fees arise. Compared with the cost of the fragmented commercial tools '
  'it consolidates, development is economically justified.')
doc.add_heading('3.3.3 Operational Feasibility', level=3)
P('The interface follows familiar job-board and social-network patterns, so minimal training is '
  'required. Role-specific navigation keeps each workspace small; screens include empty states, '
  'validation messages and honest banners explaining simulated steps such as local email verification. '
  'Keyboard support (Ctrl+K command palette) and responsive layouts for mobile and desktop were '
  'verified, indicating smooth operational adoption.')

# ---------------- CHAPTER 4 ----------------
doc.add_heading('CHAPTER 4: SYSTEM DESIGN', level=1)

doc.add_heading('4.1 Use Case Diagram', level=2)
P('The platform defines three actors. The Developer manages a profile, connects GitHub, discovers and '
  'connects with other developers, searches jobs and submits applications. The Recruiter maintains a '
  'company presence, publishes job postings and reviews, moves, interviews or rejects applicants. The '
  'Administrator (superuser) handles moderation and operational support and can act in either role for '
  'demonstration purposes. Every protected use case is guarded by server-side authentication and '
  'capability checks.')
add_figure(os.path.join(FIG, 'image5.png'), 'Figure 4.1: Primary Actor-to-Use-Case View')

doc.add_heading('4.2 Data Flow Diagrams', level=2)
P('Figure 4.2 shows the context-level (Level 0) diagram: the DevConnect platform exchanges credentials, '
  'profile and application data with developers and recruiters, OAuth metadata with the GitHub API, '
  'verification messages with the email provider, and returns matches, statuses and notifications.')
add_figure(os.path.join(FIG, 'image3.png'), 'Figure 4.2: Data Flow Diagram \u2014 Level 0')
P('Figure 4.3 decomposes the platform into five major processes: 1.0 Identity & Profiles, 2.0 Networking '
  '& Community, 3.0 Jobs & Applications, 4.0 Matching Service and 5.0 Notifications & Administration. '
  'All processes read and write the PostgreSQL persistent store; processes 2.0 and 4.0 additionally '
  'exchange OAuth metadata and optional explanation support with external services.')
add_figure(os.path.join(FIG, 'image4.png'), 'Figure 4.3: Data Flow Diagram \u2014 Level 1')

doc.add_heading('4.3 Logical Architecture', level=2)
P('Figure 4.4 presents the three-tier logical architecture. The React + Vite browser client speaks '
  'HTTPS to the versioned REST API; the Node.js + Express service enforces authentication, validation '
  'and ownership rules, queries PostgreSQL through Prisma, performs server-side GitHub integration and '
  'emits notification events. An optional LLM and the email provider are peripheral services; core '
  'matching remains deterministic if they are unavailable.')
add_figure(os.path.join(FIG, 'image2.png'), 'Figure 4.4: DevConnect Logical System Architecture')

doc.add_heading('4.4 Class / Component Diagram', level=2)
P('Figure 4.5 summarises the implemented components. On the client, the router application mounts '
  'twenty-three screens behind authentication and role gates; a versioned local store acts as a cache '
  'hydrated by the session snapshot and kept current by write patches; the shared matching module '
  'computes scores and bands. On the server, the Express application mounts six routers behind '
  'authentication middleware; Zod parsing produces safe validation errors; Prisma provides access to the '
  'twelve database models. The same domain rules are re-exported on both sides so scoring and '
  'permissions behave identically in the browser preview and on the API.')
add_figure(os.path.join(FIG, 'class_diagram.png'), 'Figure 4.5: Component & Class Overview Diagram')

doc.add_heading('4.5 Activity Diagram', level=2)
P('Figure 4.6 traces the central developer journey: login, job discovery with filters, inspecting the '
  'match explanation, saving or applying, cover-note validation, the duplicate-application guard that '
  'returns HTTP 409 when the candidate has already applied, creation of the application with its first '
  'timeline event, recruiter notification, and subsequent stage movements that feed the developer\u2019s '
  'timeline and inbox.')
add_figure(os.path.join(FIG, 'activity_diagram.png'), 'Figure 4.6: Activity Diagram \u2014 Job Search and Application Flow')

doc.add_heading('4.6 Database Design', level=2)
P('Persistence is PostgreSQL managed by Prisma with two applied migrations. Figure 4.7 shows the '
  'entity-relationship diagram. The User entity is central: recruiters post Jobs through Company '
  'records, developers submit Applications that log ApplicationEvents, hold Connections, import '
  'Repositories, feature Projects, receive Notifications and generate ActivityEvents. Unique constraints '
  'enforce one account per email, one application per developer per job and one connection per user '
  'pair; composite-key join tables implement saved jobs and saved candidates. Complete column-level '
  'structures are listed in Appendix A.')
add_figure(os.path.join(FIG, 'er_diagram.png'), 'Figure 4.7: Entity-Relationship Diagram')

# ---------------- CHAPTER 5 ----------------
doc.add_heading('CHAPTER 5: IMPLEMENTATION AND RESULTS', level=1)

doc.add_heading('5.1 Tools and Technologies Used', level=2)
table_caption('Table 5.1: Tools and Technologies Used')
add_table([
 ['Layer', 'Technology', 'Version', 'Purpose'],
 ['Frontend framework', 'React', '19.2', 'Component-based single-page application'],
 ['Build tool', 'Vite', '8.3', 'Dev server and production bundling'],
 ['Styling', 'Tailwind CSS', '4.3', 'Design tokens, responsive utility styling'],
 ['Routing', 'React Router', '7.18', 'Nested routes, lazy loading, role gates'],
 ['Backend', 'Node.js + Express', '20+ / 5.1', 'Versioned REST API, middleware'],
 ['Database', 'PostgreSQL', '16', 'Persistent relational store'],
 ['ORM', 'Prisma', '6.16', 'Schema migrations and typed data access'],
 ['Security', 'jsonwebtoken / bcryptjs / zod', '9.0 / 3.0 / 4.1', 'JWT sessions, password hashing, validation'],
 ['External API', 'GitHub REST API', 'v3', 'Public repository and profile metadata'],
 ['Testing', 'Node HTTP smoke suite', 'custom', '123 automated API checks'],
 ['Tools', 'Git, GitHub, VS Code', '-', 'Version control and development'],
], widths=[1.35, 1.85, 1.0, 1.9], font_size=10)

doc.add_heading('5.2 Implementation Details', level=2)
P('The client implements twenty-three screens: public landing, authentication (login, register, forgot '
  'and reset password, email verification), the developer workspace (dashboard, job board, matches, job '
  'details, application form, applications, application detail, saved jobs, network, repositories, '
  'profile, profile editor, notifications, settings) and the recruiter workspace (overview, postings, '
  'posting editor, applicant pipeline, saved candidates, candidate profile view). A single navigation '
  'configuration renders role-appropriate desktop sidebar and mobile tab bars.')
P('The server exposes a versioned REST API under /api/v1. Authentication issues an HttpOnly, SameSite=Lax '
  'JWT cookie; every protected route passes requireAuth, and capability middleware enforces developer or '
  'recruiter actions. Request bodies are validated with Zod schemas, producing HTTP 422 responses with '
  'field details. Writes are wrapped in Prisma transactions that also fan out notifications and activity '
  'events, and return a patch of touched collections that the client merges into its cache. Prefixed '
  'public identifiers (user-, job-, app-) avoid exposing sequential database keys.')
table_caption('Table 5.2: REST API Endpoint Summary')
add_table([
 ['Group', 'Endpoints (method path)', 'Purpose'],
 ['Auth', 'POST /auth/register, /auth/login, /auth/logout, GET /auth/session, POST /auth/verify-email, POST /auth/password/forgot, /auth/password/reset', 'Accounts, JWT sessions, verification, password reset'],
 ['Profile', 'PATCH /me, PATCH /me/preferences', 'Profile and preference updates'],
 ['Discovery', 'GET /jobs, /jobs/facets, /jobs/:id, /developers, /developers/:id, /matches', 'Job board with facets and match sorting, directory, scored matches'],
 ['Applications', 'GET /applications, /applications/:id, POST /jobs/:id/apply, POST /applications/:id/withdraw, PATCH /applications/:id/status, POST /applications/:id/interview', 'Apply, withdraw, stage moves, interviews'],
 ['Network', 'GET/POST /connections, POST /connections/:id/accept, /decline, DELETE /connections/:id, PUT/DELETE /saved-jobs, /saved-candidates', 'Connections and shortlists'],
 ['Workspace', 'GET /notifications, POST /notifications/:id/read, /read-all, GET /activity, GET /repositories, POST /repositories/:id/pin, POST/DELETE /projects, POST/DELETE /github/connect', 'Inbox, activity, repository import, projects'],
 ['Recruiter', 'GET/POST /recruiter/jobs, PATCH /recruiter/jobs/:id, PUT /recruiter/jobs/:id/status, DELETE /recruiter/jobs/:id, GET /recruiter/applications', 'Posting lifecycle and applicant pipeline'],
], widths=[0.9, 3.3, 1.9], font_size=9)
P('The matching engine computes a percentage score from required-skill overlap (weight 60), '
  'preferred-skill overlap (15), experience-level fit (15) and work-mode compatibility (10). Scores are '
  'banded as Strong (75 and above), Worth a look (55 to 74) and Weak overlap (below 55); each result '
  'lists the matched and missing skills that produced it, and the matches screen explains the weights so '
  'the score can be audited by the user.')

doc.add_heading('5.3 Test Cases', level=2)
table_caption('Table 5.3: Test Cases and Results')
add_table([
 ['TC ID', 'Description', 'Input / Steps', 'Expected Result', 'Status'],
 ['TC-01', 'Register with valid data', 'Name, valid email, password >= 8 chars, role', 'Account created, session issued, verification required', 'Pass'],
 ['TC-02', 'Register with duplicate email', 'Existing email', 'HTTP 422 with field error', 'Pass'],
 ['TC-03', 'Login with wrong password', 'Registered email + wrong password', 'HTTP 401, no session', 'Pass'],
 ['TC-04', 'Protected route without session', 'GET /applications without cookie', 'HTTP 401', 'Pass'],
 ['TC-05', 'Role boundary', 'Developer calls POST /recruiter/jobs', 'HTTP 403 forbidden', 'Pass'],
 ['TC-06', 'Apply to a job', 'Valid cover note >= 40 chars', 'Application created, event logged, recruiter notified', 'Pass'],
 ['TC-07', 'Duplicate application', 'Apply twice to same job', 'HTTP 409 conflict', 'Pass'],
 ['TC-08', 'Short cover note', '20-character note', 'Validation error, application blocked', 'Pass'],
 ['TC-09', 'Stage move on foreign job', 'PATCH status on another recruiter\u2019s application', 'HTTP 403/404, record unchanged', 'Pass'],
 ['TC-10', 'Withdraw application', 'Developer withdraws own application', 'Status withdrawn, timeline updated', 'Pass'],
 ['TC-11', 'Match determinism', 'Same profile scored twice', 'Identical score and reasons', 'Pass'],
 ['TC-12', 'GitHub import failure', 'Unknown handle / API limit', 'Graceful error, no data loss', 'Pass'],
 ['TC-13', 'Disconnect GitHub', 'Remove connection', 'Imported repositories cleared from profile', 'Pass'],
 ['TC-14', 'Job filters', 'Remote + React + mid-level', 'Only matching published jobs, facets counted', 'Pass'],
 ['TC-15', 'Responsive layout', '375 px viewport, all screens', 'Tab-bar navigation, no horizontal overflow', 'Pass'],
], widths=[0.6, 1.5, 1.6, 1.7, 0.55], font_size=9)
P('Beyond the manual cases, the repository ships an automated HTTP smoke suite (npm run test:api) that '
  'exercises 123 assertions across authentication, ownership, application lifecycle, networking, '
  'matching and notification behaviour against a live PostgreSQL database; all checks pass on the '
  'delivered build.')

doc.add_heading('5.4 Results (Snapshots with Explanation)', level=2)
P('The following snapshots were captured from the running system (client at http://localhost:5173, API '
  'at http://localhost:3000, seeded PostgreSQL data). Figures 5.1 to 5.15 present the developer '
  'experience and Figures 5.16 to 5.18 the recruiter workspace.')
shots = [
 ('01-landing.png', 'Figure 5.1: Landing page introducing DevConnect to developers and recruiters'),
 ('02-login.png', 'Figure 5.2: Sign-in screen with email/password form and one-click demo accounts'),
 ('03-register.png', 'Figure 5.3: Registration screen with role selection and validation'),
 ('04-dashboard.png', 'Figure 5.4: Developer dashboard: application stats, best matches, connection requests, unread notifications and recent profile activity'),
 ('05-jobs.png', 'Figure 5.5: Job board with search, facet filters (work mode, type, experience, skills), match-based sorting and pagination'),
 ('06-matches.png', 'Figure 5.6: Explainable matches with score bands, per-job meters and the weight explainer'),
 ('07-job-details.png', 'Figure 5.7: Job details page with responsibilities, required and preferred skills, match meter and apply action'),
 ('08-apply.png', 'Figure 5.8: Application form with cover-note validation, recruiter-view preview and match snapshot'),
 ('09-applications.png', 'Figure 5.9: My applications grouped by stage from applied to offer'),
 ('10-application-detail.png', 'Figure 5.10: Application detail with stage timeline, recruiter notes and withdraw action'),
 ('11-saved-jobs.png', 'Figure 5.11: Saved jobs shortlist with unsave actions'),
 ('12-network.png', 'Figure 5.12: Network screen with suggestions, directory, incoming and sent requests and accepted connections'),
 ('13-repositories.png', 'Figure 5.13: GitHub integration screen showing imported repositories, contribution grid, stars and pinning'),
 ('14-profile.png', 'Figure 5.14: Developer profile with skills, experience, education, projects and visibility chips'),
 ('17-settings.png', 'Figure 5.15: Settings screen with appearance, notification preferences and data-source controls'),
 ('18-recruiter-overview.png', 'Figure 5.16: Recruiter overview with open postings and applicant-stage statistics'),
 ('19-recruiter-jobs.png', 'Figure 5.17: Recruiter postings manager with status badges, publish/close and delete actions'),
 ('21-recruiter-applicants.png', 'Figure 5.18: Applicant pipeline with per-stage tabs, match scores and status actions'),
]
for fname, cap in shots:
    add_figure(os.path.join(SHOTS, fname), cap)

doc.add_heading('5.5 Discussion', level=2)
P('The implemented system satisfies all six stated objectives. Every critical journey \u2014 register, '
  'verify, build profile, connect GitHub, discover, apply, review and notify \u2014 persists data through '
  'the API and survives reloads. Authorization boundaries held in testing: cross-role calls are refused '
  'with 401/403 and duplicate applications are rejected at the database constraint level. The '
  'deterministic matcher returns stable, auditable scores and the interface exposes exactly which skills '
  'raised or held down each result, keeping the AI assistance advisory rather than decisional. Response '
  'times on the local configuration were comfortable for all screens, and the responsive layouts '
  'remained usable at mobile widths. Remaining limitations are those declared in the scope: simulated '
  'email delivery in local mode, no native mobile application and no semantic-similarity ranking yet.')

# ---------------- CHAPTER 6 ----------------
doc.add_heading('CHAPTER 6: CONCLUSION AND FUTURE SCOPE', level=1)
P('DevConnect delivers a full-stack platform that brings developer profiles, consent-based GitHub '
  'repository context, professional networking, job discovery, complete application workflows, '
  'recruiter pipelines, notifications and explainable AI-assisted job matching into one responsive web '
  'application. The architecture cleanly separates the React client, the versioned Express REST API and '
  'PostgreSQL persistence, with shared domain rules guaranteeing identical behaviour on both sides. '
  'Security practices \u2014 HttpOnly JWT cookies, bcrypt hashing, Zod validation, capability and '
  'ownership checks, and server-side token handling \u2014 were implemented and verified rather than '
  'assumed. Matching remains transparent, deterministic and advisory, directly answering the '
  'interpretability and fairness concerns raised by the literature review. The project was validated '
  'through a 123-check automated API suite and fifteen documented manual test cases, all passing, and '
  'the delivered build reproduces from a documented setup with seeded demo data.')
P('Future enhancements include: semantic similarity and hybrid ranking evaluated against an agreed '
  'governed test set while preserving explanation quality; a richer skill taxonomy with profile and job '
  'normalization; deeper recruiter analytics and candidate-status transparency; real transactional email '
  'and OAuth-based GitHub authorization; accessibility and localization extensions; deployment '
  'resilience, CI/CD pipelines and monitoring; and, subject to privacy review and stakeholder approval, '
  'additional integrations such as calendar scheduling for interviews.')

# ---------------- REFERENCES ----------------
doc.add_heading('REFERENCES', level=1)
for ref in [
 '[1] D. Celik Ertugrul and S. Bitirim, "Job recommender systems: a systematic literature review, applications, open issues, and challenges," Journal of Big Data, vol. 12, art. no. 140, 2025, doi: 10.1186/s40537-025-01173-y.',
 '[2] Y. Zhang and X. Chen, "Explainable recommendation: A survey and new perspectives," Foundations and Trends in Information Retrieval, vol. 14, no. 1, pp. 1-101, 2020, doi: 10.1561/1500000066.',
 '[3] "A Survey on Artificial Intelligence (AI) based Job Recommendation Systems," in Proc. 2023 International Conference on Sustainable Computing and Data Communication Systems (ICSCDS), Erode, India, Mar. 2023, doi: 10.1109/ICSCDS56580.2023.10104718.',
 '[4] "Explainable person-job recommendations: challenges, approaches, and comparative analysis," Frontiers in Artificial Intelligence, vol. 8, 2025, doi: 10.3389/frai.2025.1660548.',
 '[5] R. S. Pressman, "Software Engineering: A Practitioner\u2019s Approach," Tata McGraw-Hill Publications, New Delhi, 6th edition, 2005.',
 '[6] React Documentation, "Learn React." [Online]. Available: https://react.dev, accessed 2026.',
 '[7] Express Documentation, "Express 5.x - API reference." [Online]. Available: https://expressjs.com, accessed 2026.',
 '[8] Prisma Documentation, "Prisma ORM and Migrations." [Online]. Available: https://www.prisma.io/docs, accessed 2026.',
 '[9] PostgreSQL Documentation, "PostgreSQL 16 Reference." [Online]. Available: https://www.postgresql.org/docs/16/, accessed 2026.',
 '[10] GitHub, "REST API v3 documentation." [Online]. Available: https://docs.github.com/en/rest, accessed 2026.',
 '[11] www.mitmeerut.ac.in, <date of retrieval: November 2026>.',
]:
    P(ref, space_after=4)

# ---------------- APPENDICES ----------------
doc.add_heading('APPENDICES', level=1)
doc.add_heading('Appendix A: Table Structures', level=2)
P('The PostgreSQL database contains twelve Prisma models plus the password-reset token table. Column '
  'types follow the schema in server/prisma/schema.prisma.', space_after=8)
tables = [
 ('Company', [('id', 'String PK'), ('name', 'String'), ('industry', 'String'), ('size', 'String'), ('location', 'String'), ('website', 'String?'), ('blurb', 'String'), ('logo_text', 'String?')]),
 ('User', [('id', 'String PK'), ('role', 'Enum developer/recruiter/superuser'), ('name', 'String'), ('email', 'String UNIQUE'), ('password_hash', 'String'), ('headline / location / bio', 'String / Text'), ('skills', 'String[]'), ('experience_level', 'Enum?'), ('years_of_experience', 'Int?'), ('github_username', 'String?'), ('website / linkedIn / twitter', 'String?'), ('email_verified', 'Boolean'), ('visibility', 'Enum public/connections/private'), ('notification_prefs / preferences', 'Json'), ('experience / education', 'Json[]'), ('company_id', 'FK Company?'), ('created_at', 'Timestamp')]),
 ('Job', [('id', 'String PK'), ('title', 'String'), ('company_id', 'FK Company'), ('recruiter_id', 'FK User'), ('location', 'String'), ('work_mode', 'Enum remote/hybrid/onsite'), ('job_type', 'Enum full_time/part_time/contract/internship'), ('experience_level', 'Enum junior..principal'), ('salary', 'Json?'), ('required_skills / preferred_skills', 'String[]'), ('description', 'Text'), ('responsibilities', 'String[]'), ('status', 'Enum draft/published/closed'), ('posted_at / apply_deadline', 'Timestamp?'), ('is_featured', 'Boolean')]),
 ('Application', [('id', 'String PK'), ('job_id', 'FK Job'), ('user_id', 'FK User'), ('status', 'Enum applied/under_review/interview/offer/rejected/withdrawn'), ('applied_at / updated_at', 'Timestamp'), ('cover_note', 'Text'), ('interview', 'Json?'), ('unique(job_id, user_id)', 'Constraint')]),
 ('ApplicationEvent', [('id', 'String cuid PK'), ('application_id', 'FK Application'), ('status', 'Enum'), ('at', 'Timestamp'), ('by', 'Enum developer/recruiter/system'), ('note', 'String?')]),
 ('Connection', [('id', 'String PK'), ('from_user_id', 'FK User'), ('to_user_id', 'FK User'), ('state', 'Enum pending/accepted/rejected'), ('requested_at / responded_at', 'Timestamp'), ('message', 'String?'), ('unique(from_user_id, to_user_id)', 'Constraint')]),
 ('SavedJob', [('user_id', 'FK User, part of PK'), ('job_id', 'FK Job, part of PK'), ('saved_at', 'Timestamp')]),
 ('SavedCandidate', [('user_id', 'FK User, part of PK'), ('developer_id', 'FK User, part of PK'), ('saved_at', 'Timestamp')]),
 ('Notification', [('id', 'String PK'), ('user_id', 'FK User'), ('kind', 'Enum'), ('title', 'String'), ('body', 'Text'), ('href', 'String?'), ('read', 'Boolean'), ('created_at', 'Timestamp'), ('related_id', 'String?')]),
 ('Repository', [('id', 'String PK'), ('user_id', 'FK User'), ('name', 'String'), ('description', 'Text'), ('language', 'String'), ('topics', 'String[]'), ('stars / forks / watchers', 'Int'), ('pushed_at', 'Timestamp'), ('url', 'String'), ('is_pinned', 'Boolean'), ('contributions', 'Int[]'), ('license / default_branch', 'String?')]),
 ('Project', [('id', 'String PK'), ('user_id', 'FK User'), ('title', 'String'), ('summary', 'Text'), ('tags', 'String[]'), ('url / repo_url', 'String?'), ('period', 'String?'), ('featured', 'Boolean')]),
 ('ActivityEvent', [('id', 'String PK'), ('actor_id', 'FK User'), ('kind', 'String'), ('target_id', 'String'), ('at', 'Timestamp')]),
 ('PasswordResetToken', [('id', 'String cuid PK'), ('user_id', 'FK User'), ('token', 'String UNIQUE'), ('expires_at', 'Timestamp'), ('used_at', 'Timestamp?')]),
]
for i, (name, cols) in enumerate(tables, 1):
    P('Table A.%d: Structure of %s' % (i, name), align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=3)
    add_table([('Column', 'Type / Constraint')] + list(cols), widths=[2.6, 3.0], font_size=10)

doc.add_heading('Appendix B: Additional Screenshots', level=2)
more = [
 ('15-profile-edit.png', 'Figure A.1: Profile editor with skills, experience, education and preference sections'),
 ('16-notifications.png', 'Figure A.2: Notification inbox grouped by kind with read and delete actions'),
 ('20-recruiter-job-form.png', 'Figure A.3: Create job posting form with skill pickers and draft/publish actions'),
 ('22-saved-candidates.png', 'Figure A.4: Recruiter saved-candidates shortlist'),
 ('23-candidate-profile.png', 'Figure A.5: Candidate profile as seen by a recruiter, with fit summary and save action'),
]
for fname, cap in more:
    add_figure(os.path.join(SHOTS, fname), cap)

doc.save(OUT)
print('saved', OUT, os.path.getsize(OUT), 'bytes')
