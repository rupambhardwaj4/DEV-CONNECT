import { useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Tablist + panels. `tabs` is [{ id, label, count?, panel? }].
 * - `TabPanels` renders only the active panel, so inactive screens never mount.
 * - Overflow scrolls horizontally instead of wrapping into a second row.
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  size = 'md',
  className = '',
  ariaLabel,
  panelIdBase,
}) {
  const listRef = useRef(null);
  const fallbackId = useId();
  const base = panelIdBase ?? fallbackId;

  const moveFocus = (delta) => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    if (index === -1) return;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    onChange(next.id);
    const buttons = listRef.current?.querySelectorAll('button[role="tab"]');
    buttons?.[tabs.indexOf(next)]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1); }
        if (event.key === 'Home') { event.preventDefault(); onChange(tabs[0]?.id); }
        if (event.key === 'End') { event.preventDefault(); onChange(tabs[tabs.length - 1]?.id); }
      }}
      className={cn(
        '-mx-4 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-4 sm:mx-0 sm:px-0',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${base}-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${base}-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative shrink-0 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
              size === 'sm' ? 'px-2.5 py-2 text-xs' : 'px-3 py-2.5 text-sm',
              active
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {tab.count != null && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                    active
                      ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
                      : 'bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-primary)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanels({ tabs = [], activeTab, className = '', idBase }) {
  const fallbackId = useId();
  const base = idBase ?? fallbackId;
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${base}-${active.id}`}
      aria-labelledby={`tab-${base}-${active.id}`}
      tabIndex={0}
      className={cn('focus-visible:outline-none', className)}
    >
      {active.panel}
    </div>
  );
}

/** Hook for pages that need the tab state itself (counts, deep links). */
export function useTabs(ids, initial) {
  const [activeTab, setActiveTab] = useState(initial ?? ids[0]);
  return {
    activeTab,
    setActiveTab,
    isActive: (id) => id === activeTab,
  };
}
