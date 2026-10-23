import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const defaultDurations = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 5000,
  loading: 0,
};

export const ToastContext = createContext(null);

export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      action: null,
      dismissible: true,
      ...toast,
      duration: toast.duration ?? defaultDurations[toast.type] ?? 5000,
    };
    
    setToasts(prev => [...prev.slice(-maxToasts + 1), newToast]);
    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useMemo(() => ({
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    loading: (message, options = {}) => addToast({ type: 'loading', message, duration: 0, dismissible: false, ...options }),
    promise: async (promise, messages) => {
      const loadingId = toast.loading(messages.loading || 'Loading...');
      try {
        const result = await promise;
        toast.success(messages.success || 'Success!', { id: loadingId, replace: true });
        return result;
      } catch (error) {
        toast.error(messages.error || error.message || 'Something went wrong', { id: loadingId, replace: true });
        throw error;
      }
    },
    dismiss: removeToast,
    update: updateToast,
    clear: clearToasts,
  }), [addToast, removeToast, updateToast, clearToasts]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} position={position} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove, position }) {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const containerStyles = cn(
    'fixed z-[var(--z-index-toast)] flex flex-col gap-2 pointer-events-none',
    positionStyles[position]
  );

  if (toasts.length === 0) return null;

  return (
    <div className={containerStyles} pointer-events="none" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration > 0 && !isPaused) {
      const startTime = Date.now();
      const timer = setTimeout(() => {
        dismiss();
      }, toast.duration);
      
      // Update progress bar
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration * 100));
        setProgress(remaining);
      }, 50);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [toast.duration, isPaused]);

  const dismiss = () => {
    if (!toast.dismissible) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onRemove(toast.id);
    }, 200);
  };

  const typeStyles = {
    success: 'bg-[var(--color-success)] text-white border-[var(--color-success-dark)]',
    error: 'bg-[var(--color-error)] text-white border-[var(--color-error-dark)]',
    warning: 'bg-[var(--color-warning)] text-white border-[var(--color-warning-dark)]',
    info: 'bg-[var(--color-info)] text-white border-[var(--color-info-dark)]',
    loading: 'bg-[var(--color-primary)] text-white border-[var(--color-primary-dark)]',
  };

  const Icon = icons[toast.type] || icons.info;

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border shadow-xl p-4 min-w-[320px] max-w-md transition-all duration-300 ease-out animate-slide-up',
        typeStyles[toast.type],
        isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100 hover:shadow-2xl hover:-translate-y-0.5'
      )}
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={cn(
        'flex-shrink-0 mt-0.5',
        toast.type === 'loading' && 'animate-spin'
      )}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-semibold text-sm">{toast.title}</h4>
        )}
        {toast.message && (
          <p className="text-sm opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              if (toast.action.dismiss !== false) dismiss();
            }}
            className="mt-2 text-xs font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-current rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {toast.dismissible && (
        <button
          onClick={dismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {/* Progress bar with pause indicator */}
      {toast.duration > 0 && toast.dismissible && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden rounded-b-xl">
          <div 
            className="h-full bg-white/60 transition-transform duration-100 ease-linear"
            style={{ 
              width: `${progress}%`,
              opacity: isPaused ? 0.8 : 1
            }}
          />
        </div>
      )}
    </div>
  );
}

export function Toast({ type = 'info', title, message, duration = 5000, onClose, className = '', action, dismissible = true }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const dismiss = () => {
    if (!dismissible) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  const typeStyles = {
    success: 'bg-[var(--color-success)] text-white border-[var(--color-success)]',
    error: 'bg-[var(--color-error)] text-white border-[var(--color-error)]',
    warning: 'bg-[var(--color-warning)] text-white border-[var(--color-warning)]',
    info: 'bg-[var(--color-info)] text-white border-[var(--color-info)]',
    loading: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]',
  };

  const Icon = icons[type] || icons.info;

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[var(--z-index-toast)] pointer-events-auto flex items-start gap-3 rounded-xl border shadow-xl p-4 min-w-[320px] max-w-md transition-all duration-300 ease-out',
        typeStyles[type],
        isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn('flex-shrink-0 mt-0.5', type === 'loading' && 'animate-spin')}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        {message && <p className="text-sm opacity-90 mt-0.5 leading-relaxed">{message}</p>}
        {action && (
          <button
            onClick={() => { action.onClick(); if (action.dismiss !== false) dismiss(); }}
            className="mt-2 text-xs font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-current rounded"
          >
            {action.label}
          </button>
        )}
      </div>
      
      {dismissible && (
        <button
          onClick={dismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}