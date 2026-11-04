import { cn } from '../../utils/cn';

/**
 * The only elevation rule in the app: surface + 1px border, and one shadow step for
 * genuinely raised content. No gradient borders, no glass, no shimmer overlays.
 */
export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  as: Component = 'div',
  ...props
}) {  const paddingStyles = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5', xl: 'p-6' };

  return (
    <Component
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        paddingStyles[padding],
        hover &&
          'transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={cn('mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-base font-semibold tracking-tight text-[var(--color-text-primary)]', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={cn(className)}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-4 border-t border-[var(--color-border)] pt-4', className)}>{children}</div>
  );
}

/**
 * Card with a standard header row: title, one-line description, and a right-aligned
 * action. Nearly every panel in the app is this shape, so the shape lives once.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
  footer,
  className = '',
  bodyClassName = '',
  padding = 'md',
  ...props
}) {
  const paddingStyles = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };
  return (
    <section
      className={cn(
        'min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      )}
      {...props}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(paddingStyles[padding], bodyClassName)}>{children}</div>
      {footer && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">{footer}</div>
      )}
    </section>
  );
}

/** Placeholder row inside a list card — keeps empty state in context instead of full-page. */
export function EmptyRow({ icon: Icon, children, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-8 text-center',
        className,
      )}
    >
      {Icon && <Icon aria-hidden className="h-5 w-5 text-[var(--color-text-tertiary)]" />}
      <p className="text-sm text-[var(--color-text-secondary)]">{children}</p>
    </div>
  );
}
