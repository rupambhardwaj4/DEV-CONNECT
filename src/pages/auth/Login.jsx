import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context';
import { homePathFor } from '../../routes/ProtectedRoute';
import { AuthNote, AuthShell } from './AuthShell';
import { Badge, Button, IconButton, TextInput, ValidationError } from '../../components/common';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** ProtectedRoute hands us the path the visitor wanted; tolerate both string and location shapes. */
function resolveTarget(state) {
  const from = state?.from;
  if (typeof from === 'string' && from.startsWith('/')) return from;
  if (from?.pathname) return from.pathname;
  return null;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, demoAccounts, error: sessionError } = useAuth();

  const intended = resolveTarget(location.state);
  const resetFor = location.state?.resetFor;

  const [form, setForm] = useState({ email: resetFor ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState(null);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setFormError(null);
  };

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Enter the email on your account.';
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That does not look like an email address.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setPending(true);
    setFormError(null);
    const result = await login({ email: form.email.trim(), password: form.password, remember });
    setPending(false);
    if (result.ok) navigate(intended ?? homePathFor(result.user.role), { replace: true });
    else setFormError(result.error);
  }

  async function handleDemo(account) {
    setDemoPending(account.userId);
    setFormError(null);
    const result = await loginAsDemo(account);
    setDemoPending(null);
    if (result.ok) navigate(intended ?? homePathFor(result.user.role), { replace: true });
    else setFormError(result.error);
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in to your account, or open a sample profile below to look around."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
            Create an account
          </Link>
        </>
      }
      aside={
        <AuthNote>
          DevConnect keeps your profile, applications and connections in one place. Explore a sample
          account with one click, or create your own to start from an empty workspace.
        </AuthNote>
      }
    >
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Explore an account
        </p>
        {demoAccounts.map((account) => (
          <button
            key={account.userId}
            type="button"
            onClick={() => handleDemo(account)}
            disabled={pending || demoPending !== null}
            className="group flex w-full items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors hover:border-[var(--color-accent)] disabled:opacity-60"
          >
            <Badge tone={account.label === 'Recruiter' ? 'info' : 'accent'}>{account.label}</Badge>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                {account.email}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                {account.note}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-tertiary)]">or sign in manually</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {resetFor && (
          <p className="rounded-[var(--radius-control)] border border-[var(--color-success)]/40 bg-[var(--color-success-light)] px-3 py-2.5 text-sm text-[var(--color-success-dark)] dark:text-[var(--color-success)]">
            Password updated for {resetFor}. Sign in with it now.
          </p>
        )}

        {formError && (
          <ValidationError className="text-sm">{formError}</ValidationError>
        )}

        {/* With a served session the API is the only thing that can say who is signed in, so
            the reason it could not answer belongs on this screen. */}
        {!formError && sessionError && (
          <ValidationError className="text-sm">{sessionError}</ValidationError>
        )}

        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Email
          </label>
          <TextInput
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={Mail}
            value={form.email}
            onChange={update('email')}
            invalid={Boolean(errors.email)}
            disabled={pending}
          />
          <ValidationError>{errors.email}</ValidationError>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Password
          </label>
          <TextInput
            id="login-password"
            name="password"
            type={reveal ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={Lock}
            value={form.password}
            onChange={update('password')}
            invalid={Boolean(errors.password)}
            disabled={pending}
            trailing={
              <IconButton
                type="button"
                size="sm"
                icon={reveal ? EyeOff : Eye}
                label={reveal ? 'Hide password' : 'Show password'}
                onClick={() => setReveal((prev) => !prev)}
              />
            }
          />
          <ValidationError>{errors.password}</ValidationError>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]"
            />
            Keep me signed in
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={pending}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
