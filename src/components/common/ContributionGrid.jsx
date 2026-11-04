import { cn } from '../../utils/cn';

const LEVELS = [
  'bg-[var(--color-surface-alt)]',
  'bg-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-surface-alt))]',
  'bg-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-surface-alt))]',
  'bg-[color-mix(in_srgb,var(--color-accent)_70%,var(--color-surface-alt))]',
  'bg-[var(--color-accent)]',
];

function levelFor(value) {
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 4) return 2;
  if (value <= 7) return 3;
  return 4;
}

/**
 * 366-day contribution heatmap. Data comes from the store's seeded PRNG, so a given
 * developer always renders the same grid — it is generated once, never re-rolled.
 */
export function ContributionGrid({ values = [], total, className = '' }) {
  const weeks = [];
  for (let i = 0; i < values.length; i += 7) weeks.push(values.slice(i, i + 7));

  const sum = total ?? values.reduce((acc, v) => acc + v, 0);

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">{sum}</span>{' '}
          contributions in the last year
        </p>
        <p className="hidden text-xs text-[var(--color-text-tertiary)] sm:block">weekdays and weekends</p>
      </div>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="flex w-max gap-[3px]" role="img" aria-label={`${sum} contributions over the past year`}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((value, dayIndex) => (
                <span
                  key={dayIndex}
                  title={`${value} contribution${value === 1 ? '' : 's'}`}
                  className={cn(
                    'h-[10px] w-[10px] rounded-[2px]',
                    LEVELS[levelFor(value)],
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-end gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <span>Less</span>
        {LEVELS.map((level, i) => (
          <span key={i} className={cn('h-[10px] w-[10px] rounded-[2px]', level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
