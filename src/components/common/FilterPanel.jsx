import { useState } from 'react';
import { cn } from '../../utils/cn';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { CheckboxRow } from './Toggle';

/**
 * Facet panel. Owns only its open/closed state on mobile — filter values stay with the
 * page, because the page is what turns them into a store query.
 *
 * groups: [{ name, label, type: 'checkbox'|'radio', options: [{value,label,count}], value }]
 */
export function FilterPanel({
  groups = [],
  onChange,
  onClear,
  activeCount = 0,
  resultLabel,
  className = '',
  sheetTitle = 'Filters',
}) {
  const [open, setOpen] = useState(false);

  const pick = (group, optionValue) => {
    if (group.type === 'radio') {
      onChange({ [group.name]: optionValue === group.value ? '' : optionValue });
      return;
    }
    const current = group.value ?? [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange({ [group.name]: next });
  };

  const body = (
    <div className="space-y-5">
      {groups.map((group) => (
        <fieldset key={group.name} className="min-w-0 border-0 p-0">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {group.label}
          </legend>
          <div className="space-y-1">
            {group.options.map((option) => (
              <CheckboxRow
                key={String(option.value)}
                label={option.label}
                checked={(group.value ?? []).includes(option.value) || group.value === option.value}
                onChange={() => pick(group, option.value)}
                count={option.count}
              />
            ))}
          </div>
        </fieldset>
      ))}
      {!groups.length && (
        <p className="text-sm text-[var(--color-text-tertiary)]">No filters available for this view.</p>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: persistent column */}
      <aside
        className={cn(
          'hidden w-[var(--width-sidebar)] shrink-0 md:block xl:w-64',
          className,
        )}
        aria-label="Filters"
      >
        <div className="sticky top-[calc(var(--height-header)+1rem)] max-h-[calc(100vh-var(--height-header)-2rem)] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                Clear all
              </button>
            )}
          </div>
          {body}
          {resultLabel && (
            <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
              {resultLabel}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile: sheet */}
      <div className="md:hidden">
        <Button variant="outline" size="sm" icon={SlidersHorizontal} onClick={() => setOpen(true)}>
          Filters
          {activeCount > 0 && (
            <span className="ml-1.5 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-xs tabular-nums text-[var(--color-text-inverse)]">
              {activeCount}
            </span>
          )}
        </Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title={sheetTitle}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={onClear} disabled={!activeCount}>
                Clear
              </Button>
              <Button size="sm" fullWidth onClick={() => setOpen(false)}>
                {resultLabel ?? 'Show results'}
              </Button>
            </>
          }
        >
          {body}
        </Sheet>
      </div>
    </>
  );
}

/** The row of removable chips above a result list. */
export function FilterChips({ chips = [], onRemove, onClear, className = '' }) {
  if (!chips.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <span
          key={`${chip.name}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-2.5 pr-1 text-xs text-[var(--color-text-primary)]"
        >
          <span className="max-w-[10rem] truncate">{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove filter ${chip.label}`}
            className="rounded-full p-0.5 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-medium text-[var(--color-text-secondary)] underline-offset-2 hover:text-[var(--color-text-primary)] hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

export function ActiveFilterCount({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={cn('text-xs text-[var(--color-text-secondary)]', className)}>
      {count} filter{count === 1 ? '' : 's'} applied
    </span>
  );
}
