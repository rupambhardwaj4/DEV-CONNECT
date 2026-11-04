import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

/** Bare spinner: the button's own label stays the accessible name. */
function Pending({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const BASE =
  'inline-flex items-center justify-center font-medium rounded-[var(--radius-control)] ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] ' +
  'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0';

const VARIANTS = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] ' +
    'hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-sm)] ' +
    'focus-visible:ring-[var(--color-primary)]',
  secondary:
    'bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] ' +
    'hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-sm)] ' +
    'focus-visible:ring-[var(--color-accent)]',
  outline:
    'border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] ' +
    'hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-alt)] ' +
    'focus-visible:ring-[var(--color-primary)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] ' +
    'focus-visible:ring-[var(--color-border-strong)]',
  danger:
    'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)] focus-visible:ring-[var(--color-error)]',
  link:
    'text-[var(--color-primary)] underline-offset-4 hover:underline px-0 h-auto focus-visible:ring-[var(--color-accent)]',
};

const SIZES = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

/**
 * Button. Pass `to` for a navigation button — it renders a router link with button
 * styling so no screen ever ships a button that goes nowhere.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  to,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = cn(
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    loading && 'cursor-wait opacity-75',
    className,
  );

  const content = (
    <>
      {loading && <Pending />}
      {Icon && !loading && iconPosition === 'left' && (
        <Icon aria-hidden className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      )}
      {children}
      {Icon && !loading && iconPosition === 'right' && (
        <Icon aria-hidden className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      )}
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={classes}
        aria-disabled={disabled || loading || undefined}
        onClick={(event) => {
          if (disabled || loading) event.preventDefault();
          onClick?.(event);
        }}
        {...props}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} onClick={onClick} {...props}>
      {content}
    </button>
  );
}
