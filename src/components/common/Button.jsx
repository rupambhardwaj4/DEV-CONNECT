import { cn } from '../../utils/cn';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] relative overflow-hidden';

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white shadow-sm hover:shadow-md ' +
      'hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-primary)]',
    secondary:
      'bg-[var(--color-secondary)] text-white shadow-sm hover:shadow-md ' +
      'hover:bg-[var(--color-secondary-hover)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-secondary)]',
    accent:
      'bg-[var(--color-accent)] text-white shadow-sm hover:shadow-md ' +
      'hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-accent)]',
    gradient:
      'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white ' +
      'shadow-md hover:shadow-lg hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-primary)]',
    glass:
      'backdrop-blur-md bg-white/10 border border-white/20 text-[var(--color-text-primary)] ' +
      'hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-primary)]',
    outline:
      'border-2 border-[var(--color-border)] bg-[var(--color-surface)] ' +
      'text-[var(--color-text-primary)] ' +
      'hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] ' +
      'hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))] ' +
      'hover:-translate-y-0.5 hover:shadow-sm ' +
      'focus:ring-[var(--color-primary)]',
    ghost:
      'text-[var(--color-text-secondary)] ' +
      'hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-gray-400)]',
    danger:
      'bg-[var(--color-error)] text-white shadow-sm hover:shadow-md ' +
      'hover:bg-[var(--color-error-dark)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-error)]',
    success:
      'bg-[var(--color-success)] text-white shadow-sm hover:shadow-md ' +
      'hover:bg-[var(--color-success-dark)] hover:-translate-y-0.5 ' +
      'focus:ring-[var(--color-success)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8 gap-1.5',
    md: 'px-4 py-2 text-sm h-10 gap-2',
    lg: 'px-6 py-3 text-base h-12 gap-2.5',
  };

  const isTopIcon = iconPosition === 'top';

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'opacity-75 cursor-wait',
        isTopIcon && 'flex-col gap-1 h-auto py-3',
        className,
        'group/button'
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect for loading state */}
      {loading && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Loading spinner with animation */}
      {loading && (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Icon with bounce animation on hover */}
      {Icon && (iconPosition === 'left' || isTopIcon) && !loading && (
        <Icon
          className={cn(
            'flex-shrink-0 transition-transform group-hover/button:-translate-x-0.5',
            isTopIcon ? 'h-5 w-5' : 'h-4 w-4',
          )}
          aria-hidden
        />
      )}

      <span className="relative z-10">{children}</span>

      {Icon && iconPosition === 'right' && !loading && (
        <Icon 
          className="ml-2 h-4 w-4 flex-shrink-0 transition-transform group-hover/button:translate-x-0.5" 
          aria-hidden 
        />
      )}
    </button>
  );
}
