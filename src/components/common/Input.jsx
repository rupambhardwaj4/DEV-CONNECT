import { useId } from 'react';
import { cn } from '../../utils/cn';

export function Input({
  type = 'text',
  label,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  fullWidth = false,
  className = '',
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  
  const baseStyles = 'block w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const normalStyles = 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]';
  
  const errorStyles = 'border-[var(--color-error)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]';
  
  const inputStyles = cn(
    baseStyles,
    error ? errorStyles : normalStyles,
    Icon && 'pl-10',
    fullWidth && 'w-full',
    className
  );
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1.5 text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={inputStyles}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">{helperText}</p>
      )}
    </div>
  );
}
