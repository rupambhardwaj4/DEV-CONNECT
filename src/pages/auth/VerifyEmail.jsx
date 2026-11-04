import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../../context';
import { homePathFor } from '../../routes/ProtectedRoute';
import { AuthNote, AuthShell } from './AuthShell';
import { Button } from '../../components/common';

export function VerifyEmail() {
  const navigate = useNavigate();
  const { user, isVerified, verifyEmail, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleVerify() {
    setPending(true);
    setError(null);
    // Served, this is a round trip; offline it is a flag flip. Await both the same way.
    const result = await verifyEmail();
    setPending(false);
    if (result.ok) navigate(homePathFor(user.role), { replace: true });
    else setError(result.error);
  }

  if (!user) {
    return (
      <AuthShell title="Nothing to verify">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Your session ended, so there is no address to confirm. Sign in again and this screen will
          show your account.
        </p>
        <Button to="/login" className="mt-5" fullWidth>
          Go to sign in
        </Button>
      </AuthShell>
    );
  }

  if (isVerified) {
    return (
      <AuthShell title="Email confirmed">
        <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.email}</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              This account is already confirmed.
            </p>
          </div>
        </div>
        <Button to={homePathFor(user.role)} className="mt-5" fullWidth size="lg">
          Open my dashboard
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Confirm your email"
      subtitle={`We would have sent a link to ${user.email}. Open it below to continue.`}
    >
      <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3.5">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-text-tertiary)]" aria-hidden />
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Until this is confirmed the rest of the app stays locked, which is how the real product
          behaves for unverified accounts.
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>}

      <Button onClick={handleVerify} loading={pending} className="mt-5" fullWidth size="lg">
        Open verification link
      </Button>
      <Button
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
        variant="ghost"
        fullWidth
        className="mt-2"
      >
        Use a different account
      </Button>

      <AuthNote>
        No message is sent. Pressing this marks the flag on your local profile immediately.
      </AuthNote>
    </AuthShell>
  );
}
