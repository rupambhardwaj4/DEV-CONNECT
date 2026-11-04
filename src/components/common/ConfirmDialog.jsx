import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Modal } from './Modal';

/**
 * Replacement for window.confirm. `danger` only changes the confirm button colour —
 * the actual safety of destructive actions lives in the store guards.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  children,
  className = '',
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen) confirmRef.current?.focus();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      className={cn('max-w-md', className)}
    >
      {description && (
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      )}
      {children}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          ref={confirmRef}
          variant={danger ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
