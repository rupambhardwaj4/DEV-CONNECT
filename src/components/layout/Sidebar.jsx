import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context';
import { navigationFor, primaryAction } from '../../app/navigation';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';

export function NavItem({ item, badges = {}, onNavigate }) {
  const Icon = item.icon;
  const count = item.badge ? badges[item.badge] : 0;
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
        )
      }
    >
      {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {count > 0 && (
        <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-accent-hover)]">
          {count}
        </span>
      )}
    </NavLink>
  );
}

/**
 * Role-aware sidebar. Persistent from 1024px up; the mobile drawer renders this same
 * component so the two can never drift apart.
 */
export function Sidebar({ badges = {}, onNavigate, className = '' }) {
  const { role } = useAuth();
  const nav = navigationFor(role);
  const action = primaryAction(role);

  return (
    <nav
      aria-label={`${nav.label} navigation`}
      className={cn('flex h-full min-h-0 flex-col gap-1 overflow-y-auto p-3', className)}
    >
      <div className="mb-3 hidden lg:block">
        <Logo size="sm" />
      </div>

      {action.for === 'recruiter' && (
        <Button to={action.to} size="sm" icon={action.icon} fullWidth className="mb-3">
          {action.label}
        </Button>
      )}

      <ul className="space-y-0.5">
        {nav.items.map((item) => (
          <li key={item.to}>
            <NavItem item={item} badges={badges} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-[var(--color-border)] pt-3">
        <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Account
        </p>
        <ul className="space-y-0.5">
          {nav.secondary.map((item) => (
            <li key={item.to}>
              <NavItem item={item} badges={badges} onNavigate={onNavigate} />
            </li>
          ))}
          <li>
            <NavItem item={{ to: '/settings', label: 'Settings', icon: Settings }} onNavigate={onNavigate} />
          </li>
        </ul>
      </div>
    </nav>
  );
}
