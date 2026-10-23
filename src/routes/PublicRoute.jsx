import { Navigate } from 'react-router-dom';
import { useAuth } from '../context';

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect to onboarding if user is not verified or needs onboarding
    if (!user?.isVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    // Otherwise redirect to dashboard/home
    return <Navigate to="/" replace />;
  }
  
  return children;
}
