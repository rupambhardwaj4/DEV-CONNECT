import { cn } from '../../utils/cn';
import { statusLabel } from '../../data/store.js';
import { formatDate, formatDay } from '../../utils/format.js';

const DOT = {
  applied: 'var(--color-info)',
  'under-review': 'var(--color-warning)',
  interview: 'var(--color-primary)',
  offer: 'var(--color-success)',
  rejected: 'var(--color-error)',
  withdrawn: 'var(--color-text-tertiary)',
};

/**
 * Chronological events. Used for application pipelines and profile activity, so it
 * accepts either {status, at, note} entries or free {label, at, detail} entries.
 */
export function Timeline({ entries = [], showNotes = true, className = '' }) {
  if (!entries.length) {
    return (
      <p className={cn('text-sm text-[var(--color-text-tertiary)]', className)}>No activity recorded yet.</p>
    );
  }

  return (
    <ol className={cn('relative space-y-4 border-l border-[var(--color-border)] pl-4', className)}>
      {entries.map((entry, index) => {
        const label = entry.label ?? statusLabel(entry.status);
        const detail = entry.detail ?? entry.note;
        return (
          <li key={`${entry.status ?? label}-${entry.at}-${index}`} className="relative">
            <span
              aria-hidden
              className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--color-surface)]"
              style={{ background: DOT[entry.status] ?? 'var(--color-border-strong)' }}
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]" title={formatDay(entry.at, { withTime: true })}>
                {formatDate(entry.at)}
              </p>
            </div>
            {showNotes && detail && (
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{detail}</p>
            )}
            {entry.scheduledFor && (
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Scheduled for {formatDay(entry.scheduledFor, { withTime: true })}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
