import { cn } from '../../utils/cn';

export function Logo({ size = 'md', showTagline = false, className = '' }) {
  const sizes = {
    sm:  { icon: 'w-6 h-6',   text: 'text-base',  tagline: 'text-[10px]' },
    md:  { icon: 'w-8 h-8',   text: 'text-xl',    tagline: 'text-xs' },
    lg:  { icon: 'w-10 h-10', text: 'text-2xl',   tagline: 'text-sm' },
    xl:  { icon: 'w-12 h-12', text: 'text-3xl',   tagline: 'text-base' },
  };

  const { icon, text, tagline } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* Icon mark */}
      <div
        className={cn(
          icon,
          'rounded-xl flex items-center justify-center flex-shrink-0',
          'shadow-[0_4px_12px_rgb(99_102_241/.35)]',
        )}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 100%)',
        }}
      >
        <svg
          width="56%"
          height="56%"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Two interlinked nodes forming a "connect" motif */}
          <circle cx="5" cy="10" r="2.5" fill="white" fillOpacity=".95" />
          <circle cx="15" cy="10" r="2.5" fill="white" fillOpacity=".95" />
          <circle cx="10" cy="4" r="2" fill="white" fillOpacity=".7" />
          <circle cx="10" cy="16" r="2" fill="white" fillOpacity=".7" />
          <line x1="7.2" y1="9.2" x2="8.4" y2="5.4"  stroke="white" strokeWidth="1.3" strokeOpacity=".8" strokeLinecap="round" />
          <line x1="12.8" y1="9.2" x2="11.6" y2="5.4" stroke="white" strokeWidth="1.3" strokeOpacity=".8" strokeLinecap="round" />
          <line x1="7.2" y1="10.8" x2="8.4" y2="14.6" stroke="white" strokeWidth="1.3" strokeOpacity=".8" strokeLinecap="round" />
          <line x1="12.8" y1="10.8" x2="11.6" y2="14.6" stroke="white" strokeWidth="1.3" strokeOpacity=".8" strokeLinecap="round" />
          <line x1="7.5" y1="10" x2="12.5" y2="10" stroke="white" strokeWidth="1.3" strokeOpacity=".6" strokeLinecap="round" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={cn(text, 'font-extrabold tracking-tight leading-none')}>
          <span className="text-[var(--color-text-primary)]">Dev</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Connect
          </span>
        </span>
        {showTagline && (
          <span
            className={cn(tagline, 'font-bold tracking-[0.12em] uppercase mt-0.5')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CODE · CONNECT · CAREER
          </span>
        )}
      </div>
    </div>
  );
}
