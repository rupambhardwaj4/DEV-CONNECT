import { cn } from '../../utils/cn';

/** Switch bound to a real label. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
}) {
  const inputId = id ?? label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        {label && (
          <label htmlFor={inputId} className="block cursor-pointer text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</p>
        )}
      </div>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : 'Toggle'}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
          checked
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
            : 'border-[var(--color-border-strong)] bg-[var(--color-surface-alt)]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-[1.125rem] w-[1.125rem] rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

/** Checkbox row for filter lists; native input so keyboard and screen readers work. */
export function CheckboxRow({ checked, onChange, label, count, disabled = false, className = '' }) {
  const id = `chk-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className={cn('flex items-center justify-between gap-2 py-1', className)}>
      <label htmlFor={id} className="flex min-w-0 cursor-pointer items-center gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-[var(--color-border-strong)] accent-[var(--color-primary)]"
        />
        <span className="truncate text-sm text-[var(--color-text-secondary)]">{label}</span>
      </label>
      {count !== undefined && (
        <span className="shrink-0 text-xs tabular-nums text-[var(--color-text-tertiary)]">{count}</span>
      )}
    </div>
  );
}
