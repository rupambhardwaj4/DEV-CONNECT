import { cn } from '../../utils/cn';
import { Search, X } from 'lucide-react';

export function SearchBar({
  placeholder = 'Search...',
  value = '',
  onChange,
  onClear,
  className = '',
  ...props
}) {
  const displayValue = value !== undefined ? value : '';
  
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };
  
  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };
  
  const inputStyles = cn(
    'w-full pl-10 pr-10 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
    className
  );
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
      
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={inputStyles}
        {...props}
      />
      
      {displayValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
