import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { cn } from '../../utils/cn';

/**
 * Shared frame for the six auth screens: brand mark, one heading, the form, and a
 * footnote slot. Kept narrow on purpose — auth is a single-column task.
 */
export function AuthShell({ title, subtitle, children, footer, aside, className }) {
  return (
    <div className="min-h-dvh bg-[var(--color-background)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[27rem]">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="md" />
          <Link
            to="/landing"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Overview
          </Link>
        </div>

        <div
          className={cn(
            'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6',
            className,
          )}
        >
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{subtitle}</p>
          )}
          <div className={subtitle ? 'mt-6' : 'mt-5'}>{children}</div>
        </div>

        {aside}
        {footer && <div className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">{footer}</div>}
      </div>
    </div>
  );
}

/** States that auth is a simulation, on every screen that could imply otherwise. */
export function AuthNote({ children }) {
  return (
    <p className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
      {children}
    </p>
  );
}
