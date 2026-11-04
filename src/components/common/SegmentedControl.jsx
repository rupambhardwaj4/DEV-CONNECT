import { cn } from '../../utils/cn';

/**
 * Small mutually-exclusive switch (sort order, pipeline view). Keyboard operates as a
 * tablist: arrows move the selection, which is the expectation for this control.
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  ariaLabel,
  className = '',
  fullWidth = false,
}) {
  const handleKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    if (index === -1) return;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-md)-2px)] font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {Icon && <Icon aria-hidden className="h-3.5 w-3.5" />}
            <span>{option.label}</span>
            {option.count != null && (
              <span className="tabular-nums text-xs text-[var(--color-text-tertiary)]">{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
