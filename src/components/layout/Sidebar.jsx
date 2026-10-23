import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard, Users, Briefcase, Package,
  Settings, User, BookOpen, UserCheck,
  Bell, Sparkles, FileText, TrendingUp,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard',       href: '/',                icon: LayoutDashboard },
  { name: 'Jobs',            href: '/jobs',            icon: Briefcase },
  { name: 'Applications',   href: '/applications',    icon: FileText },
  { name: 'Developers',     href: '/developers',      icon: Users },
  { name: 'Projects',       href: '/projects',        icon: Package },
  { name: 'Recommendations',href: '/recommendations', icon: Sparkles },
  { name: 'Learn',          href: '/learn',           icon: BookOpen },
];

const accountNavigation = [
  { name: 'Profile',        href: '/profile',         icon: User },
  { name: 'Connections',    href: '/connections',     icon: UserCheck },
  { name: 'Notifications',  href: '/notifications',   icon: Bell, badge: 3 },
  { name: 'Settings',       href: '/settings',        icon: Settings },
];

export function Sidebar({ className = '' }) {
  const location = useLocation();

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const baseItem =
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group';

  const inactiveItem = cn(
    baseItem,
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
  );

  const activeItem = cn(
    baseItem,
    'bg-[var(--color-primary)] text-white shadow-sm',
    'shadow-[0_4px_12px_rgb(99_102_241/.28)]',
  );

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-[15rem] xl:w-64 flex-shrink-0',
        'border-r border-[var(--color-border)] bg-[var(--color-surface)]',
        'sticky top-[68px] h-[calc(100vh-68px)]',
        className,
      )}
    >
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">

        {/* Main Nav */}
        <div>
          <p className="px-3 mb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
            Main
          </p>
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={active ? activeItem : inactiveItem}
                >
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 flex-shrink-0 transition-transform duration-150',
                      active ? 'text-white' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)]',
                      !active && 'group-hover:scale-110',
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Recommendations' && !active && (
                    <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-full">
                      <TrendingUp className="h-2.5 w-2.5" /> New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Nav */}
        <div>
          <p className="px-3 mb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
            Account
          </p>
          <nav className="space-y-0.5">
            {accountNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={active ? activeItem : inactiveItem}
                >
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 flex-shrink-0 transition-transform duration-150',
                      active ? 'text-white' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)]',
                      !active && 'group-hover:scale-110',
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && !active && (
                    <span className="ml-auto flex items-center justify-center h-5 min-w-[1.2rem] px-1 text-[10px] font-bold bg-[var(--color-rose)] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
