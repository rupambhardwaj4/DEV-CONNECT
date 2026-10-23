# DevConnect Folder Structure

```text
Devconnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── applications.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── connections.routes.js
│   │   │   ├── developers.routes.js
│   │   │   ├── jobs.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   └── projects.routes.js
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── migrations/
│   ├── .env
│   └── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   └── App.jsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── IconButton.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── KeyboardShortcutsHelp.jsx
│   │   │   ├── Link.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── SmartSearch.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Tag.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── index.jsx
│   │   └── layout/
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       ├── Layout.jsx
│   │       ├── Sidebar.jsx
│   │       └── index.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── index.jsx
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useDebounce.js
│   │   ├── useFetch.js
│   │   ├── useInfiniteScroll.jsx
│   │   ├── useInfiniteScroll.js.backup
│   │   └── useLocalStorage.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── index.jsx
│   │   ├── Connections.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DeveloperProfile.jsx
│   │   ├── Developers.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Home.jsx
│   │   ├── JobApplication.jsx
│   │   ├── JobDetails.jsx
│   │   ├── Jobs.jsx
│   │   ├── Landing.jsx
│   │   ├── MyApplications.jsx
│   │   ├── NotFound.jsx
│   │   ├── Notifications.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Profile.jsx
│   │   ├── ProfileEdit.jsx
│   │   ├── ProjectEdit.jsx
│   │   ├── Projects.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Settings.jsx
│   │   ├── UserProfile.jsx
│   │   └── index.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── index.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── applications.js
│   │   ├── auth.js
│   │   ├── connections.js
│   │   ├── demoData.js
│   │   ├── developers.js
│   │   ├── index.js
│   │   ├── jobs.js
│   │   ├── notifications.js
│   │   ├── projects.js
│   │   └── recommendations.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── index.css
│   │   ├── reset.css
│   │   └── variables.css
│   ├── utils/
│   │   ├── cn.js
│   │   └── format.js
│   ├── App.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── IMPROVEMENTS.md
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

Generated directories such as `node_modules/` and `dist/` are omitted.

## Planned Backend

The backend will use Express with PostgreSQL. The frontend API base URL should point
to the backend, for example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend API Areas

```text
/api/auth             Authentication, verification, and password reset
/api/developers       Developer profiles and search
/api/projects         Project management and GitHub repositories
/api/jobs             Job listings
/api/applications     Job applications
/api/connections      Developer connection requests
/api/notifications    User notifications
```

### Planned Database Tables

```text
users
profiles
skills
user_skills
projects
jobs
applications
connections
notifications
email_verification_tokens
password_reset_tokens
```
