import { cn } from '../../utils/cn';

export function Spinner({ size = 'md', className = '', ...props }) {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  const spinnerStyles = cn(
    'animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]',
    sizes[size],
    className
  );
  
  return (
    <div className={spinnerStyles} {...props}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
