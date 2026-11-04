import { cn } from '../../utils/cn';
import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * One headline number with optional context. `trend` is real delta text supplied by the
 * caller — never generated here.
 */
export function StatTile({ label, value, hint, trend, icon: Icon, className = '' }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">{label}</p>
        {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {hint && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>}
          {trend != null && trend !== '' && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                String(trend).startsWith('-')
                  ? 'text-[var(--color-error)]'
                  : 'text-[var(--color-success)]',
              )}
            >
              {String(trend).startsWith('-') ? (
                <TrendingDown aria-hidden className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp aria-hidden className="h-3.5 w-3.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
