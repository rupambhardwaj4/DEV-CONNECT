import { cn } from '../../utils/cn';

export function LoadingSkeleton({
  className = '',
  variant = 'default',
  shimmer = true,
  ...props
}) {
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    subtitle: 'h-5 w-2/3',
    avatar: 'h-10 w-10 rounded-full',
    avatarSm: 'h-8 w-8 rounded-full',
    avatarLg: 'h-16 w-16 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-32 w-full',
    thumbnail: 'h-48 w-full',
    stat: 'h-20 w-full',
    badge: 'h-6 w-16 rounded-full',
  };
  
  const skeletonStyles = cn(
    'rounded relative overflow-hidden',
    'bg-gradient-to-r from-[var(--color-gray-200)] via-[var(--color-gray-100)] to-[var(--color-gray-200)]',
    'bg-[length:200%_100%]',
    shimmer && 'animate-shimmer',
    variants[variant],
    className
  );
  
  return <div className={skeletonStyles} {...props} />;
}

export function CardSkeleton({ className = '', animated = true }) {
  return (
    <div className={cn(
      'rounded-xl border border-[var(--color-border)] p-4 animate-pulse',
      className
    )}>
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full opacity-10 blur-lg" />
          <div className="relative h-10 w-10 rounded-full bg-[var(--color-gray-200)]" />
        </div>
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="title" />
          <LoadingSkeleton variant="text" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className = '' }) {
  return (
    <div className={cn('rounded-xl border border-[var(--color-border)] p-4', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="avatar" />
          <LoadingSkeleton variant="badge" />
        </div>
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="subtitle" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LoadingSkeleton variant="title" className="w-48" />
          <LoadingSkeleton variant="text" className="w-64" />
        </div>
        <LoadingSkeleton variant="button" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
