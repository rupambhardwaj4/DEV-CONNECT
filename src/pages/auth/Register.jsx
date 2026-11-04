import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, MapPin, User } from 'lucide-react';
import { useAuth } from '../../context';
import { AuthNote, AuthShell } from './AuthShell';
import {
  Button,
  IconButton,
  SegmentedControl,
  TextInput,
  ValidationError,
} from '../../components/common';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ROLE_COPY = {
  developer: 'Job matches, applications and your developer profile.',
  recruiter: 'Job postings, the applicant pipeline and saved candidates.',
};

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    role: 'developer',
    name: '',
    email: '',
    headline: '',
    location: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [pending, setPending] = useState(false);

  const set = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setFormError(null);
  };

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Both passwords must match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setPending(true);
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      headline: form.headline.trim(),
      location: form.location.trim(),
    });
    setPending(false);
    if (result.ok) navigate('/verify-email', { replace: true });
    else setFormError(result.error);
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Create an account to build a profile, apply to roles and connect with teams — you'll start from a clean slate."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </>
      }
      aside={
        <AuthNote>
          New accounts start with an email to verify and an empty profile, so every screen begins at
          zero and fills in as you go.
        </AuthNote>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            I am a
          </span>
          <SegmentedControl
            fullWidth
            ariaLabel="Account type"
            value={form.role}
            onChange={(role) => setForm((prev) => ({ ...prev, role }))}
            options={[
              { value: 'developer', label: 'Developer' },
              { value: 'recruiter', label: 'Recruiter' },
            ]}
          />
          <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{ROLE_COPY[form.role]}</p>
        </div>

        {formError && <ValidationError className="text-sm">{formError}</ValidationError>}

        <div>
          <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Full name
          </label>
          <TextInput
            id="reg-name"
            name="name"
            autoComplete="name"
            placeholder="Aisha Khan"
            icon={User}
            value={form.name}
            onChange={set('name')}
            invalid={Boolean(errors.name)}
            disabled={pending}
          />
          <ValidationError>{errors.name}</ValidationError>
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
            Email
          </label>
          <TextInput
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={Mail}
            value={form.email}
            onChange={set('email')}
            invalid={Boolean(errors.email)}
            disabled={pending}
          />
          <ValidationError>{errors.email}</ValidationError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-headline"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Headline <span className="text-[var(--color-text-tertiary)]">optional</span>
            </label>
            <TextInput
              id="reg-headline"
              name="headline"
              placeholder={form.role === 'recruiter' ? 'Talent partner' : 'Frontend engineer'}
              value={form.headline}
              onChange={set('headline')}
              disabled={pending}
            />
          </div>
          <div>
            <label
              htmlFor="reg-location"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Location <span className="text-[var(--color-text-tertiary)]">optional</span>
            </label>
            <TextInput
              id="reg-location"
              name="location"
              placeholder="Bengaluru, IN"
              icon={MapPin}
              value={form.location}
              onChange={set('location')}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-password"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            Password
          </label>
          <TextInput
            id="reg-password"
            name="password"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
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

        <div>
          <label
            htmlFor="reg-confirm"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            Confirm password
          </label>
          <TextInput
            id="reg-confirm"
            name="confirm"
            type={reveal ? 'text' : 'password'}
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
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          After this, confirm your email to unlock the workspace, then land on your {form.role} dashboard.
        </p>
      </form>
    </AuthShell>
  );
}
