import { cn } from '../../utils/cn';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center rounded-full font-medium';
  
  const variants = {
    default: 'bg-[var(--color-primary)] text-[var(--color-white)]',
    primary: 'bg-[var(--color-primary)] text-[var(--color-white)]',
    secondary: 'bg-[var(--color-secondary)] text-[var(--color-white)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-white)]',
    success: 'bg-[var(--color-success)] text-[var(--color-white)]',
    warning: 'bg-[var(--color-warning)] text-[var(--color-white)]',
    error: 'bg-[var(--color-error)] text-[var(--color-white)]',
    danger: 'bg-[var(--color-error)] text-[var(--color-white)]',
    info: 'bg-[var(--color-info)] text-[var(--color-white)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-primary)]',
    gray: 'bg-[var(--color-gray-100)] text-[var(--color-text-primary)]',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  const badgeStyles = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );
  
  return (
    <span className={badgeStyles} {...props}>
      {children}
    </span>
  );
}
