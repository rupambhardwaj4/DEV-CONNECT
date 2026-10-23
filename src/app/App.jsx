import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, AuthProvider, useTheme } from '../context';
import { ErrorBoundary, Landing, Dashboard, Profile, ProfileEdit, DeveloperProfile, Jobs, JobDetails, JobApplication, MyApplications, Developers, Projects, ProjectEdit, Connections, Recommendations, Notifications, Settings, NotFound, Onboarding, Login, Register, ForgotPassword, ResetPassword, VerifyEmail } from '../pages';
import { Layout } from '../components/layout';
import { ProtectedRoute, PublicRoute } from '../routes';
import { CommandPalette, ToastProvider } from '../components/common';
import { useAuth } from '../context';
import { useEffect, useCallback, useState } from 'react';

// Loading fallback component
function RouteLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full opacity-20 blur-xl animate-pulse" />
        <div className="relative w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleNavigate = useCallback((route) => {
    navigate(route);
  }, [navigate]);

  const handleAction = useCallback((action) => {
    if (action === 'theme-toggle') {
      toggleTheme();
    } else if (action === 'help') {
      window.open('https://github.com/devconnect/docs', '_blank');
    } else if (action.startsWith('search-')) {
      const searchRoutes = {
        'search-developers': '/developers',
        'search-projects': '/projects',
        'search-jobs': '/jobs',
      };
      if (searchRoutes[action]) {
        navigate(searchRoutes[action]);
      }
    }
  }, [navigate, toggleTheme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      
      // ⌘⇧K or Ctrl+Shift+K for shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      
      // ? for help (when not in input) - temporarily disabled
      if (e.key === '?' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        // KeyboardShortcutsHelp component removed for now
        return;
      }
      
      // Global shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        // Toggle sidebar - could emit event
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
        return;
      }
      
      // G + letter navigation
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.target.matches('input, textarea, [contenteditable]')) {
        // We'll handle this in a separate keydown for the second key
        window.gKeyPressed = true;
        setTimeout(() => { window.gKeyPressed = false; }, 1000);
        return;
      }
      
      if (window.gKeyPressed && !e.metaKey && !e.ctrlKey && !e.target.matches('input, textarea, [contenteditable]')) {
        const routes = {
          'd': '/',
          'p': '/projects',
          'j': '/jobs',
          'c': '/connections',
          'n': '/notifications',
          's': '/settings',
          'h': '/landing',
        };
        if (routes[e.key]) {
          e.preventDefault();
          navigate(routes[e.key]);
        }
        window.gKeyPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleTheme]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Protected Routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/developers" element={<Layout><Developers /></Layout>} />
      <Route path="/developers/:id" element={<Layout><DeveloperProfile /></Layout>} />
      <Route path="/projects" element={<Layout><Projects /></Layout>} />
      <Route path="/projects/new" element={
        <ProtectedRoute>
          <Layout><ProjectEdit /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/projects/:id/edit" element={
        <ProtectedRoute>
          <Layout><ProjectEdit /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
      <Route path="/jobs/:id" element={<Layout><JobDetails /></Layout>} />
      <Route path="/jobs/:id/apply" element={
        <ProtectedRoute>
          <Layout><JobApplication /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/applications" element={<Layout><MyApplications /></Layout>} />
      <Route path="/connections" element={<Layout><Connections /></Layout>} />
      <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <Layout><ProfileEdit /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/learn" element={
        <ProtectedRoute>
          <Layout><div className="p-6"><h1>Learn</h1></div></Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <ErrorBoundary>
            <Router>
              <AppContent />
            </Router>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
