import { cn } from '../../utils/cn';

/**
 * Label/value rows. Used for profile detail, job detail and application detail so the
 * same reading rhythm holds everywhere. Stacks label above value on narrow screens.
 */
export function DetailList({ items = [], columns = 1, className = '', dense = false }) {
  return (
    <dl
      className={cn(
        'grid gap-x-6',
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
        dense ? 'gap-y-2.5' : 'gap-y-4',
        className,
      )}
    >
      {items
        .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
        .map((item) => (
          <DefinitionItem key={item.label} label={item.label}>
            {item.value}
          </DefinitionItem>
        ))}
    </dl>
  );
}

export function DefinitionItem({ label, children, className = '' }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-[var(--color-text-primary)]">{children}</dd>
    </div>
  );
}
