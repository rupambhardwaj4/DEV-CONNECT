import { cn } from '../../utils/cn';

/** Deterministic percentage bar with a real accessible value. */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = 'default',
  size = 'md',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const tones = {
    default: 'bg-[var(--color-primary)]',
    accent: 'bg-[var(--color-accent)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-error)]',
  };
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>}
          {showValue && (
            <span className="text-xs tabular-nums text-[var(--color-text-tertiary)]">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]',
          size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5',
        )}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', tones[tone] ?? tones.default)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
