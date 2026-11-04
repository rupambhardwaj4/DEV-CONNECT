import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { demo } from '../../services/api';
import { AuthNote, AuthShell } from './AuthShell';
import { Button, TextInput, ValidationError } from '../../components/common';

export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <AuthShell title="No reset token">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          This screen needs a token from the reset link. Request a new one and open the link it
          shows you.
        </p>
        <Button to="/forgot-password" className="mt-5" fullWidth>
          Request a reset link
        </Button>
      </AuthShell>
    );
  }

  const set = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setFormError(null);
  };

  function validate() {
    const next = {};
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Both passwords must match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setPending(true);
    const result = await demo.completePasswordReset(token, form.password);
    setPending(false);
    if (result.ok) navigate('/login', { state: { resetFor: result.user?.email } });
    else setFormError(result.error);
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="The token is valid until you use it or request another link."
      footer={
        <>
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && <ValidationError className="text-sm">{formError}</ValidationError>}

        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            New password
          </label>
          <TextInput
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            invalid={Boolean(errors.password)}
            disabled={pending}
          />
          <ValidationError>{errors.password}</ValidationError>
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Confirm password
          </label>
          <TextInput
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            icon={Lock}
            value={form.confirm}
            onChange={set('confirm')}
            invalid={Boolean(errors.confirm)}
            disabled={pending}
          />
          <ValidationError>{errors.confirm}</ValidationError>
        </div>

        <Button type="submit" fullWidth size="lg" loading={pending}>
          Update password
        </Button>
      </form>

      <AuthNote>
        Choose a strong password of at least 8 characters. You'll use it to sign in from now on.
      </AuthNote>
    </AuthShell>
  );
}
