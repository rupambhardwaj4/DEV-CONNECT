import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/** Bare input control. Wrap in <Field> for a label, hint and error wiring. */
export const Input = forwardRef(function Input(
  { className = '', invalid = false, size = 'md', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-[var(--radius-control)] border bg-[var(--color-surface)] px-3',
        'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus:border-[var(--color-accent)]',
        'disabled:cursor-not-allowed disabled:bg-[var(--color-surface-alt)] disabled:text-[var(--color-text-tertiary)]',
        invalid
          ? 'border-[var(--color-error)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
        size === 'sm' ? 'h-9 text-sm' : 'h-10 text-sm',
        size === 'lg' && 'h-12 text-base',
        className,
      )}
      {...props}
    />
  );
});
