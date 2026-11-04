import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const META = {
  success: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Success' },
  error: { icon: CircleAlert, color: 'var(--color-error)', label: 'Error' },
  warning: { icon: TriangleAlert, color: 'var(--color-warning)', label: 'Warning' },
  info: { icon: Info, color: 'var(--color-info)', label: 'Notice' },
};

const DURATIONS = { success: 3600, error: 6000, warning: 5000, info: 4500 };

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.slice(-2), { id, type: 'info', title: '', message: '', ...toast }]);
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, options = {}) => push({ type: 'success', message, ...options }),
      error: (message, options = {}) => push({ type: 'error', message, ...options }),
      warning: (message, options = {}) => push({ type: 'warning', message, ...options }),
      info: (message, options = {}) => push({ type: 'info', message, ...options }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-3 z-[var(--z-index-toast)] flex flex-col gap-2',
        'bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-4',
        'md:inset-x-auto md:right-5 md:bottom-auto md:top-[calc(var(--height-header)+0.75rem)] md:w-[22rem]',
      )}
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const meta = META[toast.type] ?? META.info;
  const duration = toast.duration ?? DURATIONS[toast.type];
  const [leaving, setLeaving] = useState(false);

  const close = useCallback(() => {
    if (toast.dismissible === false) return;
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 160);
  }, [onDismiss, toast.dismissible, toast.id]);

  useEffect(() => {
    if (toast.duration === 0 || duration <= 0) return undefined;
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [close, duration, toast.duration]);

  const Icon = meta.icon;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-3.5 shadow-[var(--shadow-lg)]',
        'transition-all duration-150',
        leaving ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100',
      )}
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.color }} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {toast.title || meta.label}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              if (toast.action.dismiss !== false) close();
            }}
            className="mt-2 rounded text-xs font-semibold underline underline-offset-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible !== false && (
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 shrink-0 rounded p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Inline, non-ported banner for messages that belong inside a panel or form. */
export function Toast({ type = 'info', title, message, action, onClose, className }) {
  const meta = META[type] ?? META.info;
  const Icon = meta.icon;
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3',
        className,
      )}
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.color }} aria-hidden />
      <div className="min-w-0 flex-1">
        {(title || meta.label) && (
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{title || meta.label}</p>
        )}
        {message && (
          <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold underline underline-offset-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
