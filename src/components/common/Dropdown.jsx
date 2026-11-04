import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Accessible dropdown: a trigger button plus a menu of children. Roving focus is derived
 * from the rendered `[role="menuitem"]` nodes, so callers can compose items, separators,
 * labels and custom rows without a config object.
 */
export function Dropdown({
  trigger,
  label,
  children,
  align = 'end',
  width = 'w-56',
  className = '',
  menuClassName = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  const menuItems = () =>
    Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? []);

  const focusItem = (index) => {
    const items = menuItems();
    if (!items.length) return;
    items[(index + items.length) % items.length]?.focus();
  };

  const onKeyDown = (event) => {
    if (!open) return;
    const items = menuItems();
    const current = items.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector('button')?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-flex', className)}
      onKeyDown={onKeyDown}
    >
      {trigger !== undefined ? (
        <TriggerSlot label={label} disabled={disabled} open={open} onToggle={() => setOpen((o) => !o)}>
          {trigger}
        </TriggerSlot>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)]',
            'bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors',
            'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]',
            'disabled:cursor-not-allowed disabled:opacity-55',
            open && 'border-[var(--color-border-strong)] bg-[var(--color-surface-alt)]',
          )}
        >
          <span>{label}</span>
        </button>
      )}

      {open && (
        <div
          ref={menuRef}
          id={listId}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          className={cn(
            'absolute top-full z-[var(--z-index-dropdown)] mt-1.5 overflow-hidden rounded-[var(--radius-card)]',
            'border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]',
            width === 'full' ? 'w-full min-w-56' : width,
            align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
            menuClassName,
          )}
          onClick={(event) => {
            if (event.target.closest('[role="menuitem"]')) setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Custom triggers are rendered inside the control button, so callers pass markup rather
 * than fighting nested-button markup.
 */
function TriggerSlot({ label, disabled, open, onToggle, children }) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={typeof label === 'string' ? label : undefined}
      disabled={disabled}
      onClick={onToggle}
      className="inline-flex rounded-[var(--radius-md)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {children}
    </button>
  );
}

export function DropdownItem({
  children,
  icon: Icon,
  onClick,
  danger = false,
  disabled = false,
  active = false,
  hint,
  className = '',
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-45',
        danger
          ? 'text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]'
          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]',
        active && 'bg-[var(--color-surface-alt)]',
        className,
      )}
    >
      {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">{hint}</span>}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-[var(--color-border)]" />;
}

export function DropdownLabel({ children, className = '' }) {
  return (
    <p
      className={cn(
        'px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]',
        className,
      )}
    >
      {children}
    </p>
  );
}
