import { useId } from 'react';
import { cn } from '../../utils/cn';

export function Select({
  label,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  options = [],
  className = '',
  id,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  
  const baseStyles = 'block w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const normalStyles = 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]';
  
  const errorStyles = 'border-[var(--color-error)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]';
  
  const selectStyles = cn(
    baseStyles,
    error ? errorStyles : normalStyles,
    fullWidth && 'w-full',
    className
  );
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block mb-1.5 text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        disabled={disabled}
        className={selectStyles}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">{helperText}</p>
      )}
    </div>
  );
}
