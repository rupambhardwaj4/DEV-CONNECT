import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '../../context';
import {
  Menu, X, Moon, Sun, Bell, Search, LogOut,
  User, Users, Code2, Settings, FileText,
  ChevronDown, Zap,
} from 'lucide-react';
import { Avatar, Logo } from '../common';
import { authService } from '../../services';
import { cn } from '../../utils/cn';

/* ─── Shared button style for all icon-only actions ─────────── */
const iconBtn =
  'flex items-center justify-center w-9 h-9 rounded-lg ' +
  'text-[var(--color-text-secondary)] ' +
  'hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] ' +
  'transition-colors duration-150';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen,   setIsUserMenuOpen]   = useState(false);
  const [isScrolled,       setIsScrolled]       = useState(false);
  const [unreadCount]                           = useState(3);

  const userMenuRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* click-outside closes dropdown */
  useEffect(() => {
    const fn = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* route change closes everything */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard',  href: '/' },
    { name: 'Jobs',       href: '/jobs' },
    { name: 'Developers', href: '/developers' },
    { name: 'Projects',   href: '/projects' },
  ];

  const menuItems = [
    { name: 'My Profile',       href: '/profile',      icon: User },
    { name: 'My Applications',  href: '/applications', icon: FileText },
    { name: 'Connections',      href: '/connections',  icon: Users },
    { name: 'Notifications',    href: '/notifications',icon: Bell },
    { name: 'My Projects',      href: '/projects',     icon: Code2 },
    { name: 'Settings',         href: '/settings',     icon: Settings },
  ];

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) {}
    logout();
    navigate('/login');
  };

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <header
      className={cn(
        'app-header sticky top-0 z-[var(--z-index-sticky)]',
        'border-b border-[var(--color-border)]',
        'transition-shadow duration-300',
        isScrolled && 'shadow-[0_1px_24px_rgb(0_0_0/.07)]',
      )}
    >
      <div className="app-header-inner">

        {/* ══════════════════════════════════════════════════════
            MAIN ROW  — fixed 68 px tall, three equal-weight zones
        ══════════════════════════════════════════════════════ */}
        <div className="flex items-center h-[68px] gap-4">

          {/* ── 1. Logo ──────────────────────────────────────── */}
          <Link to="/" className="flex-shrink-0 mr-2">
            <Logo size="md" />
          </Link>

          {/* ── 2. Desktop nav — centred, pill container ─────── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                    active
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/8'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]',
                  )}
                >
                  {item.name}
                  {/* active underline dot */}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── 3. Right actions — all 36×36, uniform gap ───── */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Search pill — visible ≥ lg */}
            <button
              onClick={() => navigate('/developers')}
              aria-label="Search"
              className={cn(
                'hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg',
                'text-sm font-medium text-[var(--color-text-secondary)]',
                'border border-[var(--color-border)] bg-[var(--color-surface-alt)]',
                'hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
                'transition-all duration-150',
              )}
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs pr-0.5">Search</span>
              <kbd className={cn(
                'inline-flex items-center h-5 px-1.5 ml-1',
                'text-[10px] font-semibold rounded',
                'bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)]',
                'border border-[var(--color-border)]',
              )}>
                ⌘K
              </kbd>
            </button>

            {/* Search icon — visible md → lg */}
            <button
              onClick={() => navigate('/developers')}
              aria-label="Search"
              className={cn(iconBtn, 'lg:hidden')}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Divider */}
            <span className="hidden md:block w-px h-5 bg-[var(--color-border)] mx-1" />

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className={cn(iconBtn, 'relative')}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute top-1.5 right-1.5',
                    'flex items-center justify-center',
                    'min-w-[16px] h-4 px-1 rounded-full',
                    'text-[9px] font-bold leading-none',
                    'bg-[var(--color-rose)] text-white',
                    'ring-2 ring-[var(--color-surface)]',
                  )}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={iconBtn}
            >
              {theme === 'light'
                ? <Moon className="h-4 w-4" />
                : <Sun  className="h-4 w-4" />
              }
            </button>

            {/* Divider */}
            <span className="w-px h-5 bg-[var(--color-border)] mx-1" />

            {/* User trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-label="Open user menu"
                aria-expanded={isUserMenuOpen}
                className={cn(
                  'flex items-center gap-2.5 h-9 pl-1.5 pr-3 rounded-lg',
                  'border transition-all duration-150',
                  isUserMenuOpen
                    ? 'border-[var(--color-primary)]/40 bg-[var(--color-surface-alt)]'
                    : 'border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]',
                )}
              >
                {/* Avatar */}
                <span className="flex-shrink-0">
                  <Avatar
                    fallback={user?.name?.[0] ?? '?'}
                    alt={user?.name ?? 'User'}
                    size="sm"
                  />
                </span>

                {/* Name — hidden on small screens */}
                <span className="hidden sm:block text-sm font-semibold text-[var(--color-text-primary)] max-w-[90px] truncate leading-none">
                  {user?.name?.split(' ')[0] ?? 'Account'}
                </span>

                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-[var(--color-text-tertiary)] transition-transform duration-200 flex-shrink-0',
                    isUserMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* ── Dropdown ──────────────────────────────────── */}
              {isUserMenuOpen && (
                <div
                  className={cn(
                    'absolute right-0 top-[calc(100%+8px)] w-64',
                    'bg-[var(--color-surface)] border border-[var(--color-border)]',
                    'rounded-2xl shadow-[var(--shadow-xl)]',
                    'z-[var(--z-index-dropdown)]',
                    'overflow-hidden',
                    'animate-fade-up',
                  )}
                >
                  {/* User card */}
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar fallback={user?.name?.[0] ?? '?'} alt={user?.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-snug">
                          {user?.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)] truncate leading-snug">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Plan pill */}
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg',
                      'bg-[var(--color-surface-alt)] border border-[var(--color-border)]',
                    )}>
                      <Zap className="h-3.5 w-3.5 text-[var(--color-amber)] flex-shrink-0" />
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Free plan
                      </span>
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="ml-auto text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[var(--color-border)]" />

                  {/* Nav items */}
                  <div className="py-1.5 px-1.5">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                          'text-sm text-[var(--color-text-secondary)]',
                          'hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
                          'transition-colors duration-100',
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                        <span className="flex-1">{item.name}</span>
                        {item.name === 'Notifications' && unreadCount > 0 && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold rounded-full bg-[var(--color-rose)] text-white">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[var(--color-border)]" />

                  {/* Sign out */}
                  <div className="py-1.5 px-1.5">
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
                        'text-sm font-medium text-[var(--color-error)]',
                        'hover:bg-[var(--color-error)]/8',
                        'transition-colors duration-100',
                      )}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger — shown < md */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className={cn(iconBtn, 'md:hidden ml-0.5')}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE DRAWER
        ══════════════════════════════════════════════════════ */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] animate-fade-up">

            {/* Main nav */}
            <div className="px-2 pt-3 pb-1 space-y-0.5">
              {navLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      active
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]',
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-[var(--color-border)] mx-4 my-2" />

            {/* Account items */}
            <div className="px-2 pb-1 space-y-0.5">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="text-xs font-bold text-[var(--color-rose)]">{unreadCount}</span>
                  )}
                </Link>
              ))}
            </div>

            <div className="h-px bg-[var(--color-border)] mx-4 my-2" />

            {/* Sign out */}
            <div className="px-2 pb-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/8 transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
