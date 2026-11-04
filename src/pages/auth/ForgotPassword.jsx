import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { demo } from '../../services/api';
import { AuthNote, AuthShell } from './AuthShell';
import { Button, TextInput, ValidationError } from '../../components/common';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [issued, setIssued] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError('Enter the email on the account you want to reset.');
      return;
    }
    setPending(true);
    const result = await demo.requestPasswordReset(email.trim());
    setPending(false);
    if (result.ok) setIssued({ ...result, email: email.trim() });
    else setError(result.error);
  }

  if (issued) {
    return (
      <AuthShell
        title="Reset link ready"
        subtitle="For your security, the reset link is shown here rather than sent in the open."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {issued.knownEmail
              ? `A secure reset link was generated for ${issued.email}.`
              : `We don't have an account for ${issued.email}. Reset links only work for a registered address — try the one you signed up with.`}
          </p>
          <Link
            to={`/reset-password?token=${issued.token}`}
            className="block truncate rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 font-mono text-sm text-[var(--color-accent)] hover:border-[var(--color-accent)]"
          >
            /reset-password?token={issued.token}
          </Link>
          <Button to="/login" variant="outline" fullWidth>
            Back to sign in
          </Button>
        </div>
        <AuthNote>
          Reset links are single-use and expire after 60 minutes. If you didn't request this, you can
          safely ignore it.
        </AuthNote>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter the email on your account and we'll generate a secure reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Email
          </label>
          <TextInput
            id="reset-email"
            type="email"
            autoComplete="email"
            icon={Mail}
            placeholder="you@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            invalid={Boolean(error)}
            disabled={pending}
          />
          <ValidationError>{error}</ValidationError>
        </div>

        <Button type="submit" fullWidth size="lg" loading={pending}>
          Create reset link
        </Button>
      </form>
    </AuthShell>
  );
}
