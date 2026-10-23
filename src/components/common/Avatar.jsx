import { useState } from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

export function Avatar({
  src,
  alt = '',
  size = 'md',
  className = '',
  fallback,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  
  const sizeStyles = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  };
  
  const avatarStyles = cn(
    'rounded-full bg-[var(--color-gray-200)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)]',
    sizeStyles[size],
    className
  );
  
  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={avatarStyles}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  }
  
  return (
    <div className={avatarStyles} {...props}>
      {fallback ? (
        <span className="font-medium text-[var(--color-text-secondary)]">
          {fallback}
        </span>
      ) : (
        <User className="h-1/2 w-1/2 text-[var(--color-text-tertiary)]" />
      )}
    </div>
  );
}
