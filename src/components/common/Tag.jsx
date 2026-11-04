import { cn } from '../../utils/cn';
import { Check, Plus, X } from 'lucide-react';

export function Tag({
  children,
  onRemove,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: 'border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
    primary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
    matched:
      'border border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
    missing: 'border border-dashed border-[var(--color-border-strong)] text-[var(--color-text-tertiary)]',
    removable:
      'border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent-hover)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 truncate rounded-[var(--radius-md)] font-medium',
        variants[variant] ?? variants.default,
        sizes[size],
        onRemove && 'pr-1',
        className,
      )}
      {...props}
    >
      {variant === 'matched' && <Check aria-hidden className="h-3 w-3 shrink-0" />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${children}`}
          className="shrink-0 rounded p-0.5 transition-opacity hover:opacity-70"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

/**
 * Skill list with optional match semantics: entries present in `matched` render as
 * satisfied, entries in `missing` render as gaps. Used by job cards and job detail.
 */
export function SkillList({
  skills = [],
  matched = [],
  missing = [],
  max = 6,
  onAdd,
  className = '',
  emptyLabel = 'No skills listed',
}) {
  if (!skills.length) {
    return <p className={cn('text-xs text-[var(--color-text-tertiary)]', className)}>{emptyLabel}</p>;
  }

  const shown = max ? skills.slice(0, max) : skills;
  const overflow = skills.length - shown.length;
  const isMatch = (skill) => matched.some((s) => s.toLowerCase() === skill.toLowerCase());
  const isMissing = (skill) => missing.some((s) => s.toLowerCase() === skill.toLowerCase());

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {shown.map((skill) => {
        const variant = isMatch(skill) ? 'matched' : isMissing(skill) ? 'missing' : 'default';
        return (
          <li key={skill}>
            <Tag variant={variant}>{skill}</Tag>
          </li>
        );
      })}
      {overflow > 0 && (
        <li className="text-xs text-[var(--color-text-tertiary)]">+{overflow} more</li>
      )}
      {onAdd && (
        <li>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <Plus aria-hidden className="h-3 w-3" />
            Add
          </button>
        </li>
      )}
    </ul>
  );
}
