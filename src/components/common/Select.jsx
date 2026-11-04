import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Bare native select — native behaviour on phones beats a custom menu. */
export const Select = forwardRef(function Select(
  { className = '', invalid = false, children, options, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full appearance-none rounded-[var(--radius-control)] border bg-[var(--color-surface)] pl-3 pr-9',
          'text-sm text-[var(--color-text-primary)] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus:border-[var(--color-accent)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-surface-alt)]',
          invalid
            ? 'border-[var(--color-error)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
          className,
        )}
        {...props}
      >
        {(options ?? []).map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"
      />
    </div>
  );
});
