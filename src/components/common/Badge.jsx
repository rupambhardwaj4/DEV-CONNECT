import { cn } from '../../utils/cn';
import { statusLabel } from '../../data/store.js';

/**
 * Soft-toned labels. Text colour + a 12% tint of the same hue keeps the badge readable in
 * both themes without inventing a second palette.
 */
const TONES = {
  neutral: 'var(--color-text-secondary)',
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-error)',
  accent: 'var(--color-accent)',
  ink: 'var(--color-text-primary)',
};

export function Badge({
  children,
  variant = 'default',
  tone = null,
  size = 'md',
  className = '',
  ...props
}) {
  const toneMap = {
    default: 'neutral',
    gray: 'neutral',
    outline: 'neutral',
    primary: 'ink',
    secondary: 'ink',
    accent: 'accent',
    success: 'success',
    warning: 'warning',
    error: 'danger',
    danger: 'danger',
    info: 'info',
  };
  const resolved = tone ?? toneMap[variant] ?? 'neutral';
  const solid = ['primary', 'secondary', 'accent'].includes(variant) && resolved !== 'neutral';
  const color = solid ? 'var(--color-text-inverse)' : TONES[resolved];
  const background = solid ? TONES[resolved] : `color-mix(in srgb, ${TONES[resolved]} 12%, transparent)`;
  const border = variant === 'outline' ? '1px solid var(--color-border)' : 'none';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium',
        sizes[size],
        className,
      )}
      style={{ color, background, border }}
      {...props}
    >
      {children}
    </span>
  );
}

const APPLICATION_TONE = {
  applied: 'info',
  'under-review': 'warning',
  interview: 'accent',
  offer: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
};

const JOB_STATUS_TONE = {
  published: 'success',
  draft: 'neutral',
  closed: 'danger',
};

const WORK_MODE_TONE = {
  remote: 'info',
  hybrid: 'warning',
  onsite: 'neutral',
};

/**
 * Domain badge. `kind` picks the vocabulary so an application, a posting, a connection
 * state or a work mode all read the same way across screens.
 */
export function StatusBadge({ status, kind = 'application', className = '' }) {
  if (!status) return null;
  const table =
    kind === 'job'
      ? JOB_STATUS_TONE
      : kind === 'workMode'
        ? WORK_MODE_TONE
        : APPLICATION_TONE;
  const tone = table[status] ?? 'neutral';
  return (
    <Badge tone={tone} className={className}>
      {statusLabel(status)}
    </Badge>
  );
}

const BAND_TONE = { strong: 'success', good: 'info', fair: 'warning' };
/** Compact score label for list rows; full explanation lives in MatchMeter. */
export function MatchBadge({ match, className = '' }) {
  if (!match) return null;
  return (
    <Badge tone={BAND_TONE[match.band] ?? 'neutral'} className={cn('tabular-nums', className)}>
      {match.score}% match
    </Badge>
  );
}

const CONNECTION_TONE = {
  connected: 'success',
  incoming: 'accent',
  outgoing: 'info',
  none: 'neutral',
  declined: 'danger',
  self: 'neutral',
  pending: 'accent',
};

const CONNECTION_LABEL = {
  connected: 'Connected',
  incoming: 'Request pending',
  outgoing: 'Request sent',
  none: 'Not connected',
  declined: 'Previously declined',
  self: 'You',
  pending: 'Pending',
};

/**
 * Relationship from the *viewer's* perspective — the state the store derives from the
 * real connection row. `incoming` means the other person asked you.
 */
export function ConnectionStateBadge({ state, className = '' }) {
  if (!state || state === 'self') return null;
  return (
    <Badge tone={CONNECTION_TONE[state] ?? 'neutral'} className={className}>
      {CONNECTION_LABEL[state] ?? statusLabel(state)}
    </Badge>
  );
}
