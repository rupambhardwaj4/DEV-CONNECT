import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from '../context';
import { ToastProvider } from '../components/common';
import { PageSpinner } from '../components/common/LoadingSkeleton';
import { Layout } from '../components/layout';
import { ProtectedRoute, PublicRoute } from '../routes';
import { ErrorBoundary } from '../pages/ErrorBoundary';

const Landing = lazy(() => import('../pages/Landing').then((m) => ({ default: m.Landing })));
const Login = lazy(() => import('../pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(
  () => import('../pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = lazy(
  () => import('../pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword })),
);
const VerifyEmail = lazy(
  () => import('../pages/auth/VerifyEmail').then((m) => ({ default: m.VerifyEmail })),
);

const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Jobs = lazy(() => import('../pages/Jobs').then((m) => ({ default: m.Jobs })));
const JobDetails = lazy(() => import('../pages/JobDetails').then((m) => ({ default: m.JobDetails })));
const JobApplication = lazy(
  () => import('../pages/JobApplication').then((m) => ({ default: m.JobApplication })),
);
const Matches = lazy(() => import('../pages/Matches').then((m) => ({ default: m.Matches })));
const SavedJobs = lazy(() => import('../pages/SavedJobs').then((m) => ({ default: m.SavedJobs })));
const MyApplications = lazy(
  () => import('../pages/MyApplications').then((m) => ({ default: m.MyApplications })),
);
const ApplicationDetail = lazy(
  () => import('../pages/ApplicationDetail').then((m) => ({ default: m.ApplicationDetail })),
);
const Network = lazy(() => import('../pages/Network').then((m) => ({ default: m.Network })));
const DeveloperProfile = lazy(
  () => import('../pages/DeveloperProfile').then((m) => ({ default: m.DeveloperProfile })),
);
const Profile = lazy(() => import('../pages/Profile').then((m) => ({ default: m.Profile })));
const ProfileEdit = lazy(() => import('../pages/ProfileEdit').then((m) => ({ default: m.ProfileEdit })));
const Repositories = lazy(
  () => import('../pages/Repositories').then((m) => ({ default: m.Repositories })),
);
const Notifications = lazy(
  () => import('../pages/Notifications').then((m) => ({ default: m.Notifications })),
);
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })));
const NotFound = lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })));

const RecruiterOverview = lazy(() =>
  import('../pages/recruiter/RecruiterOverview').then((m) => ({ default: m.RecruiterOverview })),
);
const RecruiterJobs = lazy(() =>
  import('../pages/recruiter/RecruiterJobs').then((m) => ({ default: m.RecruiterJobs })),
);
const JobForm = lazy(() => import('../pages/recruiter/JobForm').then((m) => ({ default: m.JobForm })));
const RecruiterApplicants = lazy(() =>
  import('../pages/recruiter/RecruiterApplicants').then((m) => ({ default: m.RecruiterApplicants })),
);
const SavedCandidates = lazy(() =>
  import('../pages/recruiter/SavedCandidates').then((m) => ({ default: m.SavedCandidates })),
);

function Fallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <PageSpinner label="Loading this screen" />
    </div>
  );
}

/** The app shell for every signed-in route. */
function AppFrame() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

function RoleGate({ allow }) {
  return (
    <ProtectedRoute allow={allow}>
      <Outlet />
    </ProtectedRoute>
  );
}

/**
 * `/` is the developer dashboard, but a visitor with no session gets the public page
 * rather than a redirect they cannot explain.
 */
function RootRoute() {
  const { isAuthenticated, isVerified, isDeveloper } = useAuth();
  if (!isAuthenticated) return <Landing />;
  if (!isVerified) return <Navigate to="/verify-email" replace />;
  if (!isDeveloper) return <Navigate to="/recruiter" replace />;
  return <Dashboard />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/" element={<AppFrame />}>
          <Route index element={<RootRoute />} />

          {/* Both roles can read these. */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="developers/:id" element={<DeveloperProfile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<ProfileEdit />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />

          <Route element={<RoleGate allow={['developer']} />}>
            <Route path="jobs/:id/apply" element={<JobApplication />} />
            <Route path="matches" element={<Matches />} />
            <Route path="saved" element={<SavedJobs />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="network" element={<Network />} />
            <Route path="repositories" element={<Repositories />} />
          </Route>

          <Route element={<RoleGate allow={['recruiter']} />}>
            <Route path="recruiter" element={<RecruiterOverview />} />
            <Route path="recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="recruiter/jobs/new" element={<JobForm />} />
            <Route path="recruiter/jobs/:id/edit" element={<JobForm />} />
            <Route path="recruiter/applicants" element={<RecruiterApplicants />} />
            <Route path="recruiter/candidates" element={<SavedCandidates />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
