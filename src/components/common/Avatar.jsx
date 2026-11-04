import { useState } from 'react';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format.js';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
};

/** Muted tints only — a monogram should identify, not decorate. */
const TINTS = [
  ['#111827', '#f3f1ee'],
  ['#334155', '#eef1f4'],
  ['#5b4a3f', '#f5efe9'],
  ['#2f5d50', '#e9f2ef'],
  ['#5a3b46', '#f4ecee'],
  ['#3f4a6b', '#ecf0f8'],
];

function tintFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return TINTS[hash % TINTS.length];
}

/**
 * Monogram avatar. The dataset ships no photography — generating initials locally keeps
 * the demo working offline and avoids fake faces, so `src` is only used when a user has
 * pasted their own image URL in profile settings.
 */
export function Avatar({
  src,
  name = '',
  alt,
  size = 'md',
  square = false,
  className = '',
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const label = alt ?? (name ? name : 'Avatar');
  const shape = square ? 'rounded-[var(--radius-md)]' : 'rounded-full';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={label}
        onError={() => setFailed(true)}
        className={cn('shrink-0 object-cover', SIZES[size], shape, className)}
        {...props}
      />
    );
  }

  const [background, foreground] = tintFor(name || label || 'x');
  return (
    <span
      aria-label={label}
      role="img"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-semibold',
        SIZES[size],
        shape,
        className,
      )}
      style={{ background, color: foreground }}
      {...props}
    >
      {initials(name) || '—'}
    </span>
  );
}

export function AvatarStack({ users = [], max = 5, size = 'sm', className = '' }) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  if (!shown.length) return null;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((user) => (
        <Avatar
          key={user.id ?? user.name}
          name={user.name}
          src={user.avatar}
          size={size}
          className="ring-2 ring-[var(--color-surface)]"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-[var(--color-surface-alt)] font-medium text-[var(--color-text-secondary)] ring-2 ring-[var(--color-surface)]',
            SIZES[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
