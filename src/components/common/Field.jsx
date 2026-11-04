import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Select } from './Select';

/**
 * Form field shell: label, control, hint, and an inline error wired with
 * aria-invalid / aria-describedby so assistive tech announces the problem with the field.
 */
export function Field({ label, htmlFor, hint, error, required, children, className, labelClassName }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-[0.8125rem] font-medium text-[var(--color-text-secondary)]',
            labelClassName,
          )}
        >
          {label}
          {required && <span className="ml-1 text-[var(--color-accent)]" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="flex items-start gap-1.5 text-xs text-[var(--color-error)]"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs text-[var(--color-text-tertiary)]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const TextInput = forwardRef(function TextInput(
  { className = '', invalid = false, icon: Icon, leading, trailing, size = 'md', ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      {(Icon || leading) && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
          {Icon ? <Icon className="h-4 w-4" aria-hidden /> : leading}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded-[var(--radius-control)] border bg-[var(--color-surface)] text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-tertiary)] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus:border-[var(--color-accent)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-surface-alt)] disabled:text-[var(--color-text-tertiary)]',
          invalid
            ? 'border-[var(--color-error)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
          size === 'sm' ? 'h-9 text-sm' : 'h-10 text-sm',
          size === 'lg' && 'h-12 text-base',
          (Icon || leading) && 'pl-9',
          trailing && 'pr-10',
        )}
        {...props}
      />
      {trailing && (
        <span className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center text-[var(--color-text-tertiary)]">
          {trailing}
        </span>
      )}
    </div>
  );
});

/**
 * Composite label + control. Generates the id, so a form never has to keep label and
 * input ids in sync by hand.
 */
export function TextField({
  label,
  hint,
  error,
  required,
  id,
  className,
  icon: Icon,
  leading,
  trailing,
  ...inputProps
}) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <TextInput
        id={fieldId}
        icon={Icon}
        leading={leading}
        trailing={trailing}
        aria-describedby={describedBy}
        invalid={Boolean(error)}
        {...inputProps}
      />
    </Field>
  );
}

export function TextAreaField({ label, hint, error, required, id, className, rows = 4, ...props }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Field label={label} htmlFor={fieldId} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          'w-full resize-y rounded-[var(--radius-control)] border bg-[var(--color-surface)] px-3 py-2.5',
          'text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] focus:border-[var(--color-accent)]',
          error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
        )}
        {...props}
      />
    </Field>
  );
}

export function SelectField({ label, hint, error, required, id, className, options = [], children, ...props }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Field label={label} htmlFor={fieldId} hint={hint} error={error} required={required} className={className}>
      <Select
        id={fieldId}
        invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        options={options}
        {...props}
      >
        {children}
      </Select>
    </Field>
  );
}

export function FieldGroup({ children, className, orientation = 'stack' }) {  return (
    <div
      className={cn(
        orientation === 'stack' ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Horizontal label/control row used in Settings. */
export function FormRow({ label, description, control, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-[var(--color-border)] py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control ?? children}</div>
    </div>
  );
}

export function ValidationError({ children, className }) {
  if (!children) return null;
  return (
    <p role="alert" className={cn('mt-1 text-xs text-[var(--color-error)]', className)}>
      {children}
    </p>
  );
}
