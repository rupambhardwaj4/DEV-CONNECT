# DevConnect Folder Structure

Current as of 2026-10-31. The app runs in two modes from the same screens: `local`, against the
seeded store in `src/data/`, and `api`, against the Express + Prisma + PostgreSQL service in
`server/`. `VITE_DATA_SOURCE` picks one (see `README.md`).

```text
Devconnect/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   ├── App.jsx                 Router, providers, lazy routes, RoleGate
│   │   └── navigation.js           Role-aware nav config for sidebar + mobile tab bar
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── common/                 UI primitives
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ContributionGrid.jsx
│   │   │   ├── DetailList.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Field.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── IconButton.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Link.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── MatchMeter.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SegmentedControl.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Sheet.jsx
│   │   │   ├── StatTile.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Tag.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Toggle.jsx
│   │   │   └── index.jsx
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── Layout.jsx
│   │       ├── Sidebar.jsx
│   │       └── index.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── index.jsx
│   ├── data/                       Seeded snapshot + all reads/writes (only services/api.js touches it)
│   │   ├── mockConnections.js
│   │   ├── mockJobs.js
│   │   ├── mockNotifications.js
│   │   ├── mockRepositories.js
│   │   ├── mockUsers.js
│   │   └── store.js
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── useStore.js             useSyncExternalStore bindings
│   ├── lib/
│   │   ├── activity.js             Shared activity sentences (used by store and server)
│   │   ├── matching.js             Deterministic score, MATCH_WEIGHTS sum to 100
│   │   ├── profile.js              Profile-completion rules
│   │   ├── roles.js                Capability model: who may act as developer / recruiter
│   │   ├── skills.js               Skill canonicalisation
│   │   └── storage.js              Versioned localStorage engine
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── AuthShell.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── index.jsx
│   │   ├── recruiter/
│   │   │   ├── JobForm.jsx
│   │   │   ├── RecruiterApplicants.jsx
│   │   │   ├── RecruiterJobs.jsx
│   │   │   ├── RecruiterOverview.jsx
│   │   │   └── SavedCandidates.jsx
│   │   ├── ApplicationDetail.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DeveloperProfile.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── JobApplication.jsx
│   │   ├── JobDetails.jsx
│   │   ├── Jobs.jsx
│   │   ├── Landing.jsx
│   │   ├── Matches.jsx
│   │   ├── MyApplications.jsx
│   │   ├── Network.jsx
│   │   ├── NotFound.jsx
│   │   ├── Notifications.jsx
│   │   ├── Profile.jsx
│   │   ├── ProfileEdit.jsx
│   │   ├── Repositories.jsx
│   │   ├── SavedJobs.jsx
│   │   └── Settings.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx      Session + verification + RoleGate
│   │   ├── PublicRoute.jsx
│   │   └── index.jsx
│   ├── services/
│   │   ├── api.js                  The facade every page imports; each write names its local
│   │   │                           store call and its HTTP counterpart side by side
│   │   │                           and returns the same `{ ok, error }` envelope either way
│   │   │                           (also exports `usingApi()` and `API_BASE`)
│   │   │                           in `api` mode the render store is the cache this builds
│   │   └── apiClient.js            fetch wrapper: credentials, error translation, hydrate/patch
│   ├── styles/
│   │   ├── global.css
│   │   ├── index.css
│   │   ├── reset.css
│   │   └── variables.css           Design tokens (light/dark)
│   ├── types/
│   │   └── index.js                JSDoc type definitions
│   ├── utils/
│   │   ├── cn.js
│   │   └── format.js
│   ├── App.css
│   └── main.jsx
├── server/                         Express 5 + Prisma 6 + PostgreSQL (VITE_DATA_SOURCE=api)
│   ├── prisma/
│   │   ├── schema.prisma           Users, companies, jobs, applications, connections, saved rows,
│   │   │                           notifications, repositories, projects, activity, reset tokens
│   │   ├── migrations/             Committed SQL migrations — no db push in this project
│   │   └── seed.js                 Imports `src/data/mock*.js`, so both modes seed from one dataset
│   ├── scripts/
│   │   └── smoke.js                HTTP suite behind `npm run test:api`; reseeds first, prints
│   │                                 one line per check
│   ├── src/
│   │   ├── index.js                Listener + graceful shutdown
│   │   ├── app.js                  CORS with credentials, JSON + cookie parsing, /api/v1 routers,
│   │   │                           404 fallback, central error handler
│   │   ├── config.js               Env parsing (DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN, PORT,
│   │   │                           GITHUB_API_TOKEN)
│   │   ├── db.js                   The one Prisma client
│   │   ├── auth.js                 Session JWT in an HttpOnly SameSite=Lax cookie, requireAuth,
│   │   │                           requireCapability
│   │   ├── http.js                 `route` wrapper, zod `parse`, ApiError, errorHandler
│   │   ├── ids.js                  Prefixed public ids (user-, job-, act-…)
│   │   ├── domain.js               Re-exports `src/lib` rules so matching and capabilities exist once
│   │   ├── serialize.js            Row ↔ client shape, enum ↔ literal (`full_time` ↔ `full-time`)
│   │   ├── snapshot.js             `GET /auth/session` payload and the `patch` every write returns
│   │   ├── events.js               Notification + activity fan-out inside the writer's transaction
│   │   └── routes/
│   │       ├── auth.js             register, login, logout, session, verify-email, password reset,
│   │       │                       PATCH /me, PATCH /me/preferences
│   │       ├── discovery.js        Jobs board (SQL filters + `sort=match`), facets, job detail,
│   │       │                       matches, developer directory and developer detail
│   │       ├── applications.js     Apply, withdraw, recruiter status moves, interview scheduling
│   │       ├── network.js          Connections, requests, saved jobs, saved candidates
│   │       ├── workspace.js        Notifications, activity, repositories, projects, GitHub import
│   │       └── recruiter.js        Posting CRUD + publish, applicant pipeline
│   ├── .env.example                Copy to server/.env (gitignored); never a superuser password
│   └── package.json                dev, start, migrate, seed, db:reset, test:http
├── Docu_devconnect/                Project synopsis documents
├── .env.example
├── .oxlintrc.json
├── FOLDER_STRUCTURE.md
├── IMPROVEMENTS.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

Generated directories such as `node_modules/` and `dist/` are omitted.

## Two transports, one screen set

`services/api.js` is the seam. Reads never leave the render store in either mode: in `api` mode
`GET /auth/session` hands the browser the whole snapshot and each write answers with the collections it
touched, which the store merges — so pages stay synchronous and no screen knows which transport it is on.
Writes declare both halves next to each other, and a refusal comes back as the same `{ ok, error }`
envelope the store writes use.

Business rules are not duplicated: `server/src/domain.js` re-exports matching, capabilities, skills,
activity and profile-completion from `src/lib`, so a score or a permission check has one implementation
that both sides call.

Reset paths: Settings → Data & storage reloads the cache (`api`) or restores the seed (`local`);
`npm run db:seed` reloads Postgres, and `npm --prefix server run db:reset` rebuilds the schema from the
migrations first.
