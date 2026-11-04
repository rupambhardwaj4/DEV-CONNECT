import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/** Bare textarea. Wrap in <Field> for label/hint/error wiring. */
export const Textarea = forwardRef(function Textarea(
  { className = '', invalid = false, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-[var(--radius-control)] border bg-[var(--color-surface)] px-3 py-2.5',
        'text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
        'transition-colors focus:outline-none focus:ring-2',
        'focus:ring-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus:border-[var(--color-accent)]',
        'disabled:cursor-not-allowed disabled:bg-[var(--color-surface-alt)]',
        invalid
          ? 'border-[var(--color-error)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
        className,
      )}
      {...props}
    />
  );
});
