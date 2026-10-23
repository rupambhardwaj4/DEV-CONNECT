import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login with the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user needs email verification
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return children;
}
