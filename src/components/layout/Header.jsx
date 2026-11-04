import { useNavigate } from 'react-router-dom';
import { Bell, Check, LogOut, Moon, Monitor, Search, Settings, Sun, UserRound } from 'lucide-react';
import { useAuth, useTheme } from '../../context';
import { Avatar } from '../common/Avatar';
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '../common/Dropdown';
import { IconButton } from '../common/IconButton';
import { Logo } from '../common/Logo';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Follow system', icon: Monitor },
];

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 min-w-[15px] rounded-full bg-[var(--color-accent)] px-1 text-center text-[10px] font-semibold leading-[15px] text-[var(--color-text-inverse)]">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export function Header({ onOpenSidebar, onOpenSearch, unreadCount = 0, pendingRequests = 0 }) {
  const navigate = useNavigate();
  const { user, isDeveloper, isRecruiter, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="app-header sticky top-0 z-[var(--z-index-sticky)] flex h-[var(--height-header)] shrink-0 items-center gap-2 px-3 sm:gap-3 sm:px-5">
      <IconButton
        label="Open navigation"
        onClick={onOpenSidebar}
        className="lg:hidden"
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </IconButton>

      <div className="lg:hidden">
        <Logo size="sm" />
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        className="ml-auto hidden h-9 w-full max-w-[22rem] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 text-sm text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-border-strong)] md:flex"
      >
        <Search aria-hidden className="h-4 w-4" />
        <span className="flex-1 text-left">Search jobs, people, skills</span>
        <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[11px]">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative hidden h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] sm:inline-flex"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Bell aria-hidden className="h-4 w-4" />
          <UnreadBadge count={unreadCount} />
        </button>

        <Dropdown
          label="Change theme"
          width="w-48"
          trigger={
            <span className="inline-flex h-8 w-8 items-center justify-center">
              {theme === 'dark' ? (
                <Moon aria-hidden className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun aria-hidden className="h-4 w-4" />
              ) : (
                <Monitor aria-hidden className="h-4 w-4" />
              )}
            </span>
          }
        >
          <DropdownLabel>Appearance</DropdownLabel>
          {THEME_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              icon={option.icon}
              active={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
              {theme === option.value && <Check aria-hidden className="ml-auto h-3.5 w-3.5 text-[var(--color-accent)]" />}
            </DropdownItem>
          ))}
        </Dropdown>

        <Dropdown
          label={user?.name ? `Account menu for ${user.name}` : 'Account'}
          width="w-60"
          trigger={
            <span className="inline-flex h-8 items-center gap-2 rounded-full pl-1 pr-1.5 hover:bg-[var(--color-surface-alt)]">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-[var(--color-text-primary)] sm:block">
                {user?.name?.split(' ')[0]}
              </span>
            </span>
          }
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user?.name}</p>
            <p className="truncate text-xs text-[var(--color-text-tertiary)]">{user?.email}</p>
          </div>
          <DropdownSeparator />
          {isRecruiter && (
            <DropdownItem icon={Monitor} onClick={() => navigate('/recruiter')}>
              Recruiter workspace
            </DropdownItem>
          )}
          {isDeveloper && (
            <DropdownItem icon={UserRound} onClick={() => navigate('/profile')}>
              My profile
            </DropdownItem>
          )}
          {isDeveloper && pendingRequests > 0 && (
            <DropdownItem icon={Bell} hint={String(pendingRequests)} onClick={() => navigate('/network?tab=requests')}>
              Connection requests
            </DropdownItem>
          )}
          <DropdownItem icon={Settings} onClick={() => navigate('/settings')}>
            Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={LogOut} danger onClick={() => logout()}>
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
