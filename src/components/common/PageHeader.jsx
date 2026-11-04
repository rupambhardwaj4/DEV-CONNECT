import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Standard page opening: eyebrow, title, one-line description, right-aligned actions. */
export function PageHeader({ eyebrow, title, description, actions, back, className }) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back?.to && (
          <Link
            to={back.to}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {back.label ?? 'Back'}
          </Link>
        )}
        {eyebrow && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
