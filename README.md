# DevConnect

A modern developer networking platform where developers can create professional profiles, connect with other developers, showcase GitHub projects, discover jobs, and find relevant opportunities.

## Tech Stack

- **Frontend Framework**: React 19 with Vite
- **Routing**: React Router
- **Styling**: Plain CSS with CSS Variables for theming
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

## Features

- **Authentication**: Login, registration, password reset, email verification
- **Onboarding**: Guided multi-step profile completion flow
- **Professional Profiles**: Developer profiles with skills, projects, and experience
- **Project Showcase**: GitHub integration and project highlighting
- **Job Board**: Job discovery with filtering and matching
- **Developer Networking**: Connect with peers and build relationships
- **Dark/Light Theme**: Persistent theme support with system preference detection
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Accessible UI**: WCAG compliant with keyboard navigation and screen reader support

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Devconnect
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your API base URL:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Project Structure

```
src/
├── app/                 # Application entry point (App.jsx)
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── common/         # UI components (Button, Input, Card, Logo, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, Layout, Footer)
│   ├── forms/          # Form components (ready for use)
│   ├── developers/     # Developer-specific components (ready)
│   ├── projects/       # Project-specific components (ready)
│   ├── jobs/           # Job-specific components (ready)
│   └── notifications/  # Notification components (ready)
├── context/            # React context providers (Theme, Auth)
├── hooks/              # Custom React hooks (useFetch, useLocalStorage, useDebounce)
├── pages/              # Page components
│   ├── auth/           # Authentication pages (Login, Register, Forgot Password, etc.)
│   ├── Landing.jsx     # Public landing page
│   ├── Home.jsx        # Dashboard/home page
│   ├── Profile.jsx     # User profile page
│   ├── Jobs.jsx        # Job listings page
│   ├── Developers.jsx  # Developer discovery page
│   ├── Projects.jsx    # Project showcase page
│   ├── Onboarding.jsx  # First-time user onboarding flow
│   ├── NotFound.jsx    # 404 page
│   └── ErrorBoundary.jsx # Application error boundary
├── routes/             # Route guards (ProtectedRoute, PublicRoute)
├── services/           # API services (api.js, auth.js)
├── styles/             # Global styles and CSS variables
└── utils/              # Utility functions (cn, format)
```

## Pages & Routes

### Public Routes
- `/landing` - Public landing page with features and CTAs
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token
- `/verify-email` - Email verification with token

### Protected Routes
- `/` - Dashboard/home
- `/developers` - Browse developers
- `/projects` - Browse projects
- `/jobs` - Browse jobs
- `/profile` - User profile
- `/onboarding` - First-time user onboarding (redirected after registration)
- `/settings` - User settings
- `/learn` - Learning resources

## Design System

### Brand Identity

- **Logo**: Custom gradient logo with tagline "CODE · CONNECT · CAREER"
- **Primary Colors**: Electric blue (#3b82f6), Indigo (#6366f1), Violet (#8b5cf6)
- **Neutral Colors**: White, Gray, Slate, Navy palette
- **Typography**: System sans-serif with consistent scale (xs to 5xl)
- **Spacing**: Consistent scale (xs to 3xl)
- **Shadows**: 6 levels (xs to 2xl)
- **Border Radius**: 6 levels (sm to full)

### Components

Available reusable components (17 total):
- **Form Controls**: Button, Input, Textarea, Select, SearchBar
- **Display**: Card (with sub-components), Avatar, Badge, Tag, Logo
- **Feedback**: LoadingSkeleton, Spinner, EmptyState, Toast, Modal
- **Navigation**: Link, IconButton
- **Layout**: Header, Sidebar, Layout, Footer

All components support loading, disabled, and error states where applicable.

## Authentication Flow

1. **Registration**: Users register with name, email, and password
2. **Email Verification**: Users verify their email via token link
3. **Onboarding**: Guided 5-step flow to complete profile:
   - Basic information (name, location, website)
   - Bio and about section
   - Skills selection
   - GitHub integration
   - Job and collaboration preferences
4. **Login**: Email/password authentication with remember me option
5. **Password Reset**: Email-based password reset flow

## API Integration

### API Client (`src/services/api.js`)
- Configurable base URL via environment variables
- Automatic timeout handling (30s default)
- Consistent error normalization
- Authentication token management (Bearer tokens)
- Support for file uploads

### Auth Service (`src/services/auth.js`)
The auth service includes mock implementations for development. Once the backend is available, update the following endpoints:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email
- `GET /auth/me` - Get current user info
- `PUT /auth/profile` - Update user profile

**Note**: The auth service currently uses mock responses for development. Replace the mock implementations with actual API calls once the backend is available.

## Theme Support

The application supports light and dark themes:
- Theme preference is persisted in localStorage
- Respects system preferences by default
- Smooth transitions between themes
- All components are theme-aware

## Accessibility

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels and roles
- Focus states visible
- Reduced motion support via CSS media queries
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: 1024px - 1280px
- Large Desktop: > 1280px

## Development Notes

### Authentication State
- User session stored in localStorage
- Token and user data persisted
- Automatic session checking on app load
- Protected routes redirect to login with intended destination

### Route Guards
- `ProtectedRoute`: Requires authentication, redirects to login
- `PublicRoute`: Redirects authenticated users away from auth pages
- Email verification checked on protected routes

### Form Validation
- Client-side validation with inline error messages
- Password requirements shown during registration
- Email format validation
- Password confirmation matching

### Loading States
- All forms show loading state during submission
- Disabled buttons prevent duplicate submissions
- Spinner components for async operations

## License

MIT
