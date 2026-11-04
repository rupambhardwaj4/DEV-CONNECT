import { cn } from '../../utils/cn';

/**
 * Brand mark: a solid navy tile with the connection glyph knocked out in the on-primary
 * ink, and a two-tone wordmark. No gradient fills and no glow — a gradient tile rendered
 * blank wherever the paint server failed to resolve, which made the mark invisible on
 * light surfaces.
 */
export function Logo({ size = 'md', showTagline = false, className = '' }) {
  const sizes = {
    sm:  { icon: 'h-6 w-6',   text: 'text-base',  tagline: 'text-[10px]' },
    md:  { icon: 'h-8 w-8',   text: 'text-xl',    tagline: 'text-xs' },
    lg:  { icon: 'h-10 w-10', text: 'text-2xl',   tagline: 'text-sm' },
    xl:  { icon: 'h-12 w-12', text: 'text-3xl',   tagline: 'text-base' },
  };

  const { icon, text, tagline } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div
        className={cn(
          icon,
          'flex shrink-0 items-center justify-center rounded-[var(--radius-md)]',
          'bg-[var(--color-primary)] text-[var(--color-text-on-primary)]',
        )}
      >
        <svg viewBox="0 0 160 160" className="h-full w-full" role="img" aria-label="DevConnect icon">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="58,54 32,80 58,106" strokeWidth="10" />
            <polyline points="102,54 128,80 102,106" strokeWidth="10" />
            <line x1="68" y1="80" x2="92" y2="80" strokeWidth="5" />
          </g>
          <circle cx="68" cy="80" r="8" fill="currentColor" />
          <circle cx="92" cy="80" r="8" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={cn(text, 'font-extrabold tracking-tight leading-none')}>
          <span className="text-[var(--color-text-primary)]">Dev</span>
          <span className="text-[var(--color-accent)]">Connect</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              tagline,
              'mt-0.5 font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]',
            )}
          >
            CODE · CONNECT · CAREER
          </span>
        )}
      </div>
    </div>
  );
}

export default Logo;
