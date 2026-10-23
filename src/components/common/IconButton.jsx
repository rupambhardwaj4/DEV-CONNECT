import { cn } from '../../utils/cn';

export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] focus:ring-[var(--color-gray-500)]',
    primary: 'bg-[var(--color-primary)] text-[var(--color-white)] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
    danger: 'bg-[var(--color-error)] text-[var(--color-white)] hover:bg-[var(--color-error-dark)] focus:ring-[var(--color-error)]',
  };
  
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const buttonStyles = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );
  
  return (
    <button className={buttonStyles} disabled={disabled} {...props}>
      <Icon className={iconSizes[size]} />
    </button>
  );
}
