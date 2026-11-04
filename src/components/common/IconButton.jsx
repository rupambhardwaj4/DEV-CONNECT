import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const SIZES = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const ICON_SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

const VARIANTS = {
  ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
  solid: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
  danger: 'text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] hover:text-[var(--color-error)]',
};

/**
 * Square icon control. `label` is required — an icon without a name is unreadable to a
 * screen reader. Pass `icon` or children, not both.
 */
export const IconButton = forwardRef(function IconButton({
  icon: Icon,
  label,
  size = 'md',
  variant = 'ghost',
  active = false,
  className = '',
  children,
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
        SIZES[size],
        VARIANTS[variant],
        active && 'bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]',
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden className={ICON_SIZES[size]} /> : children}
    </button>
  );
});
