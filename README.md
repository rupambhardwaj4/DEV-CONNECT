# DevConnect

A developer networking and job-matching product that runs in **two modes from the same screens**:

- **`local`** (default) — every screen runs against a seeded dataset persisted to browser storage, with
  no network request, no mail transport and no real OAuth. This is the clickable demonstration.
- **`api`** — the same screens talk to a versioned REST service in `server/`: Express 5, Prisma and
  PostgreSQL, JWT sessions in an HttpOnly cookie, server-side GitHub import, and the application,
  connection and notification writes all persisted for real.

Switching is one environment variable (`VITE_DATA_SOURCE=local|api`); no page knows which one is active.

## What actually runs vs. what is faked

| Works for real | Faked, and where |
| --- | --- |
| Auth, email verification, password reset, profile edit — bcrypt hashes, signed JWT, role and ownership checks in `api` mode | No mail is sent: in `local` mode the verification link is a button, and in `api` mode the reset token is returned to the screen instead of mailed |
| Job board search, filters, sort, match scoring, save, apply — `GET /api/v1/jobs` runs the filters and `sort=match` in SQL | Company names, postings and people are demo content |
| Applications, connections, shortlists, notifications — written to Postgres and re-read after a refresh | |
| GitHub repositories — the API calls GitHub and stores the rows; no provider token ever reaches the browser | `local` mode renders seeded sample data and says so |
| Recruiter posting CRUD, publish/unpublish, applicant pipeline, saved candidates | |
| Deterministic match scoring with written-out reasons, identical in both transports (`src/lib/matching.js`) | |

## Tech stack

- **React 19** + **Vite 8** (rolldown bundler)
- **React Router 7** — nested routes, `RoleGate`, lazy-loaded route chunks
- **Tailwind CSS v4** (CSS-first config) + a token layer in `src/styles/variables.css`
- **lucide-react** icons, **framer-motion** for the landing entrance only
- **Context API** for auth and theme; a `useSyncExternalStore` store binding for data
- **server/** — **Express 5**, **Prisma 6** + **PostgreSQL**, `jsonwebtoken`, `bcryptjs`, `zod`, `cookie-parser`

## Getting started

### Frontend only (no database needed)

```bash
npm install
npm run dev      # http://localhost:5173
```

### With the API

Requires a local PostgreSQL instance — no containers are involved.

```bash
npm install
cp server/.env.example server/.env      # then set DATABASE_URL and JWT_SECRET
npm run db:migrate                      # prisma migrate dev (applies server/prisma/migrations)
npm run db:seed                         # loads the same dataset the offline demo uses
npm run dev:api                         # http://localhost:3000/api/v1
npm run dev                             # in a second shell, with VITE_DATA_SOURCE=api in .env
```

`npm run test:api` runs the HTTP suite against a running server (123 checks: health, auth envelope,
filters and match sorting, ownership and role refusals, application and connection rules, GitHub import
and disconnect, recruiter CRUD, superuser capabilities). It reseeds before and after, so it leaves no
test accounts behind in the candidate directory.

Other scripts:

```bash
npm run build    # production bundle into dist/
npm run preview  # serve the built dist/ (used for verification)
npm run lint     # oxlint
```

### Demo accounts

The sign-in page lists one-click demo logins. Manual sign-in accepts any seeded email with password
`demo1234`.

- **Superuser** — `avery.sandoval@devconnect.test` (every screen in both workspaces, a finished
  profile, plus four postings with an applicant in each status)
- **Developer** — `priya.raman@devconnect.test` (live applications, connections, pending requests, a
  half-finished profile)
- **Recruiter** — `nathan.boone@devconnect.test` (job postings with an applicant pipeline in every status)

`superuser` is a capability, not a third workspace: `src/lib/roles.js` answers "does this role act as a
developer / recruiter?", so the review account passes either route gate and never gets redirected out of
its own screens. Screens that would otherwise contradict themselves stay honest — your own posting hides
the apply call-to-action, your own candidate page hides "Save candidate".

In `local` mode, signing in, editing, saving or applying writes only to `localStorage` under the
`devconnect:` keys, and **Settings → Data & storage → Reset workspace** restores the seed. In `api` mode
the same screen reads **Reload from the server**, which discards the cached copy and re-reads Postgres.
A browser that already holds an older snapshot receives the review account through a one-time seed pack
(`applySeedPacks` in `src/data/store.js`), which appends only the missing rows and leaves edits in place.

Settings → Data & storage also reports which transport is live ("Source of truth").

## Seed data volume

27 users (21 developers, 5 recruiters, 1 superuser), 30 job postings (25 published, 3 draft, 2 closed)
across 10 companies, applications in every status, connections in every state, repositories, projects,
activity, and read + unread notifications. The same dataset seeds both modes: `src/data/mock*.js` feeds
the store directly and `server/prisma/seed.js` imports those exact modules, so a count never differs
between the offline demo and the served one.

## Matching model

Match scores are a documented heuristic, not a trained model and not random. A posting and a profile
are compared on four axes that always sum to 100 (`src/lib/matching.js`, `MATCH_WEIGHTS`):

| Axis | Weight |
| --- | --- |
| Required skills | 60 |
| Preferred skills | 15 |
| Experience level | 15 |
| Work mode | 10 |

Bands: **Strong** 75–100, **Worth a look** 55–74, **Weak overlap** 0–54. Skill names are canonicalised
before comparison (`react` = `React` = `ReactJS`), missing evidence scores zero, and the same inputs
always give the same output. The reasons behind every score are shown next to each posting.

## Project structure

```
src/
├── app/            App.jsx (router + providers), navigation.js (role-aware nav config)
├── components/
│   ├── common/     UI primitives (Button, Field, Card, Table, Tabs, Modal, Toast, CommandPalette…)
│   └── layout/     Header, Sidebar, Layout shell
├── context/        AuthContext (both transports), ThemeContext
├── data/           store.js — the render store: seed, reads, writes, hydrate/applyPatch
├── hooks/          useStore.js (useSyncExternalStore bindings), useDebounce.js
├── lib/            matching.js, skills.js, roles.js, activity.js, profile.js, storage.js
├── pages/          route components
│   ├── auth/       Login, Register, ForgotPassword, ResetPassword, VerifyEmail, AuthShell
│   └── recruiter/  RecruiterOverview, RecruiterJobs, JobForm, RecruiterApplicants, SavedCandidates
├── routes/         ProtectedRoute (+ RoleGate), PublicRoute
├── services/       api.js — the facade every page imports; apiClient.js — fetch + envelope
├── styles/         variables.css (design tokens), global.css
├── types/          JSDoc type definitions (the app stays in JSX)
└── utils/          cn, format

server/
├── prisma/         schema.prisma, migrations/, seed.js (imports src/data/* so one dataset seeds both)
├── scripts/        smoke.js — the HTTP suite behind npm run test:api
└── src/
    ├── index.js    boots the listener; app.js wires middleware, /api/v1 routers, 404 + error handler
    ├── config.js   env parsing; auth.js issues and verifies the session JWT; db.js holds the Prisma client
    ├── http.js     route wrapper, zod `parse`, ApiError, errorHandler
    ├── domain.js   re-exports the shared rules from src/lib so both sides score and authorise alike
    ├── serialize.js snapshot.js — DB row ↔ client shape, enum↔literal, cache patches
    ├── events.js    notification + activity fan-out
    └── routes/      auth, discovery, applications, network, workspace, recruiter
```

The data layer is deliberately separated from the UI: pages import `services/api.js` and
`hooks/useStore.js`, never `data/store.js` directly. In `api` mode Postgres is the source of truth and
that store becomes a cache: `GET /api/v1/auth/session` hands the browser the whole snapshot and every
write answers with the collections it touched, so reads stay synchronous and no page needs an async
read path. Business rules live in `src/lib` and are re-exported by `server/src/domain.js`, so a match
score or a capability check has exactly one implementation.

## Routes

**Public:** `/landing` · `/login` · `/register` · `/forgot-password` · `/reset-password` · `/verify-email`

**Shared (any signed-in role):** `/` dashboard · `/jobs` · `/jobs/:id` · `/jobs/:id/apply` ·
`/developers/:id` · `/profile` · `/profile/edit` · `/notifications` · `/settings`

**Developer-only:** `/matches` · `/saved` · `/applications` · `/applications/:id` · `/network` ·
`/repositories`

**Recruiter-only:** `/recruiter` · `/recruiter/jobs` · `/recruiter/jobs/new` · `/recruiter/jobs/:id/edit` ·
`/recruiter/applicants` · `/recruiter/candidates`

The role gates redirect a misplaced visitor to their own dashboard rather than the login page, so a
wrong link never looks like a sign-out.

## API surface

Everything hangs off `http://localhost:3000/api/v1`. `GET /health` (no auth) reports whether the
database is reachable.

| Group | Endpoints |
| --- | --- |
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `GET /auth/session` · `POST /auth/verify-email` · `POST /auth/password/forgot` · `POST /auth/password/reset` |
| Profile | `PATCH /me` · `PATCH /me/preferences` |
| Discovery | `GET /jobs` (filters, facets, `sort=match`) · `GET /jobs/facets` · `GET /jobs/:id` · `GET /matches` · `GET /developers` · `GET /developers/:id` |
| Applications | `GET /applications` · `GET /applications/:id` · `POST /jobs/:id/apply` · `POST /applications/:id/withdraw` · `PATCH /applications/:id/status` · `POST /applications/:id/interview` |
| Network | `GET /connections` · `GET /connections/requests` · `POST /connections` · `POST /connections/:id/accept` · `POST /connections/:id/decline` · `DELETE /connections/:id` |
| Shortlists | `GET/PUT/DELETE /saved-jobs/:jobId` · `PUT/DELETE /saved-candidates/:developerId` · `GET /saved-candidates` |
| Workspace | `GET /notifications` · `POST /notifications/:id/read` · `POST /notifications/read-all` · `DELETE /notifications/:id` · `GET /activity` · `GET /repositories` · `POST /repositories/:id/pin` · `POST/DELETE /projects/:id` |
| GitHub | `POST /github/connect` (imports public repos server-side) · `DELETE /github/connect` (drops the imported rows and the handle) |
| Recruiter | `GET/POST /recruiter/jobs` · `PATCH /recruiter/jobs/:id` · `PUT /recruiter/jobs/:id/status` · `DELETE /recruiter/jobs/:id` · `GET /recruiter/applications` |

- **Envelope** — every response is `{ ok: true, … }` or `{ ok: false, code, error }`. A write also
  returns `patch`, the collections it touched, which the client merges into its cache.
- **Session** — a signed JWT in an HttpOnly, `SameSite=Lax` cookie (`devconnect_token`, 12h). JavaScript
  never reads it, and no GitHub credential ever reaches the browser.
- **Authorisation** — `requireAuth` resolves the caller, `requireCapability` enforces the same role rules
  the UI uses (`src/lib/roles.js`), and record ownership is checked per row: a recruiter can only manage
  their own postings, a developer only reads their own applications.
- **Validation** — zod schemas at the boundary; a bad body is a `422` with field-level details, a
  business-rule refusal is `403`/`404`/`409` (re-applying to the same role is `409`, not a new row).
- **Reset** — `npm run db:seed` wipes and reloads the database; `npm run test:api` seeds before and
  after itself, so the suite is repeatable and the demo data stays pristine.

`.env` in `server/` holds `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT` and optionally
`GITHUB_API_TOKEN` (public imports work without it, at the unauthenticated rate limit). Copy
`server/.env.example`; never put a real superuser password there.

## Design system

Navy / ivory base with a single coral accent — no gradients, glassmorphism or glow.

| Token (light) | Value |
| --- | --- |
| `--color-background` | `#faf9f6` (ivory) |
| `--color-accent` | `#f4775b` (coral — CTAs, highlights, unread) |
| `--color-border` | `#e5e7eb` |
| text primary | `#111827` (navy) |

Typography is Inter (Geist fallback). A persistent sidebar anchors the desktop shell; on phones it
collapses into a drawer + a fixed bottom tab bar. Theme (light / dark / system) and reduced-motion
preferences are persisted and applied app-wide via tokens.

## Accessibility & responsiveness

Skip-to-content link, labelled controls, `role="progressbar"` on match meters, dialog / `aria-modal`
on the palette and mobile drawer, visible focus states, reduced-motion support, and a keyboard command
palette (**Ctrl / ⌘ + K**, **Ctrl / ⌘ + D** to switch theme). Layout is mobile-first across phone,
tablet and desktop breakpoints.

## License

MIT
