import { cn } from '../../utils/cn';

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'md',
  gradient = false,
  glass = false,
  animated = true,
  ...props
}) {
  const baseStyles = 'rounded-2xl border transition-all duration-300 relative overflow-hidden';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl',
  };
  
  // Gradient border effect on hover
  const gradientBorder = gradient
    ? 'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-[var(--color-primary)] before:to-[var(--color-accent)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
    : '';
  
  // Glass morphism effect for dark mode
  const glassEffect = glass
    ? 'backdrop-blur-xl bg-white/5 border-white/10'
    : 'bg-[var(--color-surface)] border-[var(--color-border)]';
  
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-border-hover)] cursor-pointer group/card'
    : '';
  
  // Animated entrance
  const animatedClass = animated ? 'animate-fade-up' : '';
  
  const cardStyles = cn(
    baseStyles,
    glassEffect,
    paddingStyles[padding],
    shadowStyles[shadow],
    gradientBorder,
    hoverStyles,
    animatedClass,
    className
  );
  
  return (
    <div className={cardStyles} {...props}>
      {/* Shimmer overlay on hover */}
      {hover && (
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full animate-shimmer" />
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4 animate-slide-down', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--color-text-primary)] tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-[var(--color-border)] animate-slide-up', className)}>
      {children}
    </div>
  );
}
