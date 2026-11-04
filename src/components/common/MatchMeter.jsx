import { cn } from '../../utils/cn';

const BAND_COLORS = {
  strong: 'var(--color-success)',
  good: 'var(--color-info)',
  fair: 'var(--color-warning)',
};

/**
 * Deterministic match display. The score is computed from skill/experience/work-mode
 * weights in src/lib/matching.js — reloading the page cannot change it.
 */
export function MatchMeter({ match, showBars = true, size = 'md', className = '' }) {
  if (!match) return null;
  const { score, band = 'fair' } = match;
  const color = BAND_COLORS[band] ?? BAND_COLORS.fair;

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'font-semibold tabular-nums',
            size === 'lg' ? 'text-xl' : 'text-sm',
          )}
          style={{ color }}
        >
          {score}%
        </span>
        <span className="text-xs capitalize text-[var(--color-text-tertiary)]">{band} match</span>
      </div>

      {showBars && (
        <div
          className={cn('mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]')}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Match strength"
        >
          <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${score}%`, background: color }} />
        </div>
      )}

      {size === 'lg' && match.reasons?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {match.reasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-sm text-[var(--color-text-secondary)]">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {size === 'lg' && match.recommendations?.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            To score higher
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-[var(--color-text-secondary)]">
            {match.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
