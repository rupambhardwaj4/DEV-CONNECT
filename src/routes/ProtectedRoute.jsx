import { Navigate, useLocation } from 'react-router-dom';
import { actsAs } from '../lib/roles.js';
import { useAuth } from '../context';
import { PageSpinner } from '../components/common/LoadingSkeleton';

export function homePathFor(role) {
  return actsAs(role, 'developer') ? '/' : '/recruiter';
}

function Gate() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <PageSpinner label="Loading your session" />
    </div>
  );
}

/**
 * @param {{ children: JSX.Element, allow?: ('developer'|'recruiter')[] }} props
 *
 * `allow` names the *capabilities* the route needs, not literal roles: a superuser acts as
 * both, so it passes either gate without every route having to list it. Recruiters reaching
 * a developer-only route are sent to their own dashboard rather than the login page, so a
 * misplaced link never looks like a sign-out. Verification is enforced here because this app
 * has no real mail transport.
 */
export function ProtectedRoute({ children, allow }) {
  const { isAuthenticated, isLoading, user, isVerified } = useAuth();
  const location = useLocation();

  if (isLoading) return <Gate />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isVerified) return <Navigate to="/verify-email" replace />;

  if (allow && !allow.some((capability) => actsAs(user.role, capability))) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return children;
}
