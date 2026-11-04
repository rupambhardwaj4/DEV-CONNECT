import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Page control for result lists. Hidden when there is one page, so an empty or tiny
 * result set never shows a dead control.
 */
export function Pagination({ page = 1, totalPages = 1, onPageChange, className = '', siblingCount = 1 }) {
  if (totalPages <= 1) return null;

  const pages = buildRange(page, totalPages, siblingCount);
  const go = (next) => onPageChange?.(Math.max(1, Math.min(totalPages, next)));

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      <Button onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <ol className="flex items-center gap-1">
        {pages.map((entry, index) =>
          entry === 'gap' ? (
            <li key={`gap-${index}`} className="px-1.5 text-sm text-[var(--color-text-tertiary)]">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => go(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={cn(
                  'min-w-[2.25rem] rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm tabular-nums transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
                  entry === page
                    ? 'bg-[var(--color-primary)] font-semibold text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]',
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ol>

      <Button onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </nav>
  );
}

function Button({ children, disabled, onClick, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[2.25rem] items-center gap-1 rounded-[var(--radius-control)] border px-3 text-sm',
        'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]',
        'transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--color-surface)]',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function buildRange(current, total, siblings) {
  const pages = [];
  const first = 1;
  const last = total;
  const start = Math.max(first + 1, current - siblings);
  const end = Math.min(last - 1, current + siblings);

  pages.push(first);
  if (start > first + 1) pages.push('gap');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < last - 1) pages.push('gap');
  if (last !== first) pages.push(last);

  return pages;
}

/** For feeds that grow rather than page. Shows remaining count so it is never a mystery. */
export function LoadMore({ onClick, shown, total, label = 'Load more', className = '' }) {
  const remaining = Math.max(0, total - shown);
  if (remaining === 0) {
    return (
      <p className={cn('py-4 text-center text-sm text-[var(--color-text-tertiary)]', className)}>
        {shown > 0 ? `All ${total} shown.` : ''}
      </p>
    );
  }
  return (
    <div className={cn('py-4 text-center', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex min-h-[2.75rem] items-center gap-2 rounded-[var(--radius-control)] border px-4 text-sm font-medium',
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]',
          'transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
        )}
      >
        {label}
        <span className="text-[var(--color-text-tertiary)]">
          ({remaining} more{remaining === 1 ? '' : ' of ' + remaining})
        </span>
      </button>
    </div>
  );
}

export function ResultsCount({ total, shown, noun = 'results', singular, query, className = '' }) {
  const word = total === 1 ? (singular ?? noun.replace(/s$/, '')) : noun;
  return (
    <p className={cn('text-sm text-[var(--color-text-tertiary)]', className)} aria-live="polite">
      <span className="font-medium text-[var(--color-text-secondary)] tabular-nums">{total}</span> {word}
      {query ? (
        <>
          {' '}
          for “<span className="text-[var(--color-text-secondary)]">{query}</span>”
        </>
      ) : null}
      {shown !== undefined && shown < total ? ` · showing ${shown}` : ''}
    </p>
  );
}
