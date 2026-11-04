import { cn } from '../../utils/cn';

/**
 * Skeletons stand in for content that would arrive over a network. They are used only
 * where a genuine delay exists (a simulated write, a lazily mounted panel) — never for
 * data already in memory.
 */
export function LoadingSkeleton({ className = '', variant = 'default', shimmer = true, ...props }) {
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    subtitle: 'h-5 w-2/3',
    avatar: 'h-10 w-10 rounded-full',
    avatarSm: 'h-8 w-8 rounded-full',
    avatarLg: 'h-16 w-16 rounded-full',
    button: 'h-10 w-24',
    card: 'h-32 w-full',
    thumbnail: 'h-44 w-full',
    stat: 'h-20 w-full',
    badge: 'h-6 w-16 rounded-full',
    row: 'h-12 w-full',
  };

  return (
    <div
      className={cn(
        'rounded bg-[var(--color-surface-alt)]',
        shimmer && 'animate-shimmer',
        variants[variant],
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="title" />
          <LoadingSkeleton variant="text" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
        className,
      )}
    >
      <div className="space-y-3">
        <LoadingSkeleton variant="badge" />
        <LoadingSkeleton variant="title" className="w-1/3" />
        <LoadingSkeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div className="divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          {Array.from({ length: columns }).map((_, j) => (
            <LoadingSkeleton key={j} className={j === 0 ? 'w-1/3' : 'flex-1'} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Simple accessible spinner for pending actions and route gates. */
export function Spinner({ size = 16, label = 'Loading', className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[var(--color-text-tertiary)]', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="status"
        aria-label={label}
        className="animate-spin"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageSpinner({ label = 'Loading' }) {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-live="polite">
      <Spinner size={22} label={label} />
      <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">{label}</span>
    </div>
  );
}

/** Whole-page placeholder: header, four stats, content columns. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading dashboard</span>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <LoadingSkeleton variant="title" className="w-48" />
          <LoadingSkeleton variant="text" className="w-64" />
        </div>
        <LoadingSkeleton variant="button" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
