import { Navigate } from 'react-router-dom';
import { useAuth } from '../context';
import { homePathFor } from './ProtectedRoute';

/** Auth pages are useless once signed in, so send people to their own dashboard. */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user, isVerified } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return children;
  if (!isVerified) return <Navigate to="/verify-email" replace />;
  return <Navigate to={homePathFor(user.role)} replace />;
}
