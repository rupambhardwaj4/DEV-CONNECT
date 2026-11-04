import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

/**
 * Bottom sheet on phones, right-side drawer from 640px up. Used for mobile filter panels
 * and applicant detail so the same content has one implementation.
 */
export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'bottom',
  className = '',
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fromBottom = side === 'bottom';

  // See Modal: portalled to <body> so a transformed page container cannot capture the fixed layer.
  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-index-modal-backdrop)] bg-[rgb(17_24_39/0.45)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute flex flex-col bg-[var(--color-surface)] shadow-[var(--shadow-xl)] outline-none',
          fromBottom
            ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--radius-xl)] border-t border-[var(--color-border)]'
            : 'inset-y-0 right-0 w-full max-w-sm border-l border-[var(--color-border)]',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
