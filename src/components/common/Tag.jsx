import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export function Tag({
  children,
  onRemove,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium transition-colors';
  
  const variants = {
    default: 'bg-[var(--color-gray-100)] text-[var(--color-text-primary)]',
    primary: 'bg-[var(--color-primary)] text-[var(--color-white)]',
    secondary: 'bg-[var(--color-secondary)] text-[var(--color-white)]',
    success: 'bg-[var(--color-success)] text-[var(--color-white)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-primary)]',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const tagStyles = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    onRemove && 'pr-1',
    className
  );
  
  return (
    <span className={tagStyles} {...props}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove tag"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
