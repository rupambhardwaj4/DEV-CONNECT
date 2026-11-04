import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth, useTheme } from '../../context';
import { actsAs } from '../../lib/roles.js';
import { navigationFor, mobileNavFor } from '../../app/navigation';
import { useStoreValue } from '../../hooks/useStore';
import * as store from '../../data/store.js';
import { CommandPalette } from '../common/CommandPalette';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

function useShellBadges(userId, role) {
  return useStoreValue(() => {
    if (!userId) return {};
    const badges = { notifications: store.getNotificationCount(userId) };
    if (actsAs(role, 'recruiter')) {
      badges.applicants = store
        .getApplicationsForRecruiter(userId)
        .filter((a) => a.status === 'applied' || a.status === 'under-review').length;
    }
    if (actsAs(role, 'developer')) {
      badges.requests = store.getPendingRequests(userId).length;
      badges.applications = store.getApplicationsForUser(userId).filter((a) => !['rejected', 'withdrawn'].includes(a.status))
        .length;
    }
    return badges;
  }, [userId, role]);
}

export function Layout({ children, showSidebar = true }) {
  const { user, role } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // The drawer closes on navigation; tracking the path and closing during render
  // avoids an effect that would synchronously unmount/re-open the dialog each route change.
  const [drawerPath, setDrawerPath] = useState(location.pathname);
  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname);
    if (drawerOpen) setDrawerOpen(false);
  }
  const badges = useShellBadges(user?.id, role);
  const nav = navigationFor(role);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => event.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // ⌘K / Ctrl+K opens the palette, ⌘D / Ctrl+D switches the theme.
  useEffect(() => {
    const onKey = (event) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (key === 'd') {
        event.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Header
        onOpenSidebar={() => setDrawerOpen(true)}
        onOpenSearch={() => setPaletteOpen(true)}
        unreadCount={badges.notifications ?? 0}
        pendingRequests={badges.requests ?? 0}
      />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        role={role}
        onNavigate={(path) => navigate(path)}
        onAction={(action) => action === 'theme' && toggleTheme()}
      />

      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <aside className="hidden w-[var(--width-sidebar)] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
            <div className="sticky top-[var(--height-header)] h-[calc(100vh-var(--height-header))]">
              <Sidebar badges={badges} />
            </div>
          </aside>
        )}

        {drawerOpen && (
          <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] lg:hidden">
            <div
              className="absolute inset-0 bg-[rgb(17_24_39/0.45)]"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 flex w-[17.5rem] max-w-[85vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  {nav.label} menu
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar badges={badges} onNavigate={() => setDrawerOpen(false)} className="flex-1" />
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1">
          <div key={location.pathname} className="app-main-content page-enter pb-24 pt-5 md:pt-7 lg:pb-10">{children}</div>
        </main>
      </div>

      {/* Phone tab bar: the destinations people return to most, no drawer needed. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[var(--z-index-fixed)] flex border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {mobileNavFor(role).map((item) => {
            const Icon = item.icon;
            const count = item.badge ? badges[item.badge] : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                    <Icon aria-hidden className="h-5 w-5" />
                    <span>{item.label}</span>
                    {count > 0 && (
                      <span className="absolute right-[22%] top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>
    </div>
  );
}

