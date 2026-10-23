import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function Link({
  to,
  children,
  variant = 'default',
  underline = false,
  className = '',
  ...props
}) {
  const baseStyles = 'transition-colors duration-200';
  
  const variants = {
    default: 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]',
    secondary: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
    muted: 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
    inherit: 'text-[var(--color-text-primary)] hover:text-[var(--color-primary)]',
  };
  
  const linkStyles = cn(
    baseStyles,
    variants[variant],
    underline && 'underline underline-offset-2',
    className
  );
  
  return (
    <NavLink to={to} className={linkStyles} {...props}>
      {children}
    </NavLink>
  );
}
