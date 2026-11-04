import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { actsAs } from '../../lib/roles.js';
import { cn } from '../../utils/cn';
import { Search, ChevronRight, Zap, Users, Code2, Briefcase, Bell, Settings, Bookmark, Plus, HelpCircle, Moon, Keyboard, Command, LayoutDashboard, User, FileText } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open this command palette' },
  { keys: ['⌘', 'D'], description: 'Toggle light / dark theme' },
  { keys: ['↑', '↓'], description: 'Move through results' },
  { keys: ['⏎'], description: 'Open the selected item' },
  { keys: ['Esc'], description: 'Close' },
];

// `icon` names a key in ICONS below. `roles` limits an entry to one workspace; shared
// entries omit it. Every route here exists in the router — no dead destinations.
const COMMANDS = [
  { id: 'dashboard', label: 'Dashboard', description: 'Your overview and pending actions', icon: 'dashboard', category: 'Navigate', route: '/', roles: ['developer'] },
  { id: 'recruiter', label: 'Recruiter overview', description: 'Pipeline and posting stats', icon: 'dashboard', category: 'Navigate', route: '/recruiter', roles: ['recruiter'] },
  { id: 'jobs', label: 'Browse jobs', description: 'Search open roles and filters', icon: 'briefcase', category: 'Navigate', route: '/jobs', roles: ['developer'] },
  { id: 'matches', label: 'Your matches', description: 'Roles ranked on your skills', icon: 'zap', category: 'Navigate', route: '/matches', roles: ['developer'] },
  { id: 'saved-jobs', label: 'Saved jobs', description: 'Postings you bookmarked', icon: 'bookmark', category: 'Navigate', route: '/saved', roles: ['developer'] },
  { id: 'applications', label: 'My applications', description: 'Track every application stage', icon: 'file-text', category: 'Navigate', route: '/applications', roles: ['developer'] },
  { id: 'network', label: 'Network', description: 'Discover, requests and connections', icon: 'users', category: 'Navigate', route: '/network', roles: ['developer'] },
  { id: 'repositories', label: 'GitHub preview', description: 'Repositories and contribution grid', icon: 'code', category: 'Navigate', route: '/repositories', roles: ['developer'] },
  { id: 'profile', label: 'My profile', description: 'How recruiters see you', icon: 'user', category: 'Navigate', route: '/profile', roles: ['developer'] },
  { id: 'profile-edit', label: 'Edit profile', description: 'Update headline, skills and links', icon: 'edit', category: 'Navigate', route: '/profile/edit', roles: ['developer'] },
  { id: 'postings', label: 'Job postings', description: 'Manage your listings', icon: 'briefcase', category: 'Navigate', route: '/recruiter/jobs', roles: ['recruiter'] },
  { id: 'new-posting', label: 'Post a job', description: 'Create a new opening', icon: 'plus', category: 'Navigate', route: '/recruiter/jobs/new', roles: ['recruiter'] },
  { id: 'applicants', label: 'Applicants', description: 'Review and move candidates', icon: 'users', category: 'Navigate', route: '/recruiter/applicants', roles: ['recruiter'] },
  { id: 'candidates', label: 'Saved candidates', description: 'Your shortlist', icon: 'bookmark', category: 'Navigate', route: '/recruiter/candidates', roles: ['recruiter'] },
  { id: 'notifications', label: 'Notifications', description: 'Activity across your account', icon: 'bell', category: 'Account', route: '/notifications' },
  { id: 'settings', label: 'Settings', description: 'Preferences, appearance and demo data', icon: 'settings', category: 'Account', route: '/settings' },
  { id: 'theme-toggle', label: 'Toggle theme', description: 'Switch between light and dark', icon: 'moon', category: 'Preferences', action: 'theme' },
  { id: 'keyboard-shortcuts', label: 'Keyboard shortcuts', description: 'View all available shortcuts', icon: 'keyboard', category: 'Help' },
];

const ICONS = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
  briefcase: <Briefcase className="h-4 w-4" />,
  bell: <Bell className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  edit: <HelpCircle className="h-4 w-4" />,
  plus: <Plus className="h-4 w-4" />,
  bookmark: <Bookmark className="h-4 w-4" />,
  'file-text': <FileText className="h-4 w-4" />,
  moon: <Moon className="h-4 w-4" />,
  keyboard: <Keyboard className="h-4 w-4" />,
  'help-circle': <HelpCircle className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
};

function CommandIcon({ name }) {
  const Icon = ICONS[name] || ICONS['layout-dashboard'];
  return <span className="flex items-center justify-center text-[var(--color-text-tertiary)]">{Icon}</span>;
}

function Shortcut({ keys }) {
  return (
    <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] font-mono">
      {keys.map((key, i) => (
        <span key={i} className="px-1.5 py-0.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded text-[10px]">
          {key}
        </span>
      ))}
    </span>
  );
}

function ShortcutItem({ shortcut }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors">
      <span className="text-sm text-[var(--color-text-secondary)]">{shortcut.description}</span>
      <Shortcut keys={shortcut.keys} />
    </div>
  );
}

export function CommandPalette(props) {
  if (!props.isOpen) return null;
  // Keyed remount = a fresh query/selection/shortcuts state on every open, with no
  // reset-on-open effect (which would cascade a second render right after opening).
  return <CommandPalettePanel key="open" {...props} />;
}

function CommandPalettePanel({ onClose, onNavigate, onAction, role }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef(null);

  const available = useMemo(
    () => COMMANDS.filter((cmd) => !cmd.roles || cmd.roles.some((capability) => actsAs(role, capability))),
    [role],
  );

  const filteredCommands = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return available;

    return available
      .filter((cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery) ||
        cmd.id.toLowerCase().includes(lowerQuery),
      )
      .map((cmd) => ({
        ...cmd,
        _score: cmd.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1,
      }))
      .sort((a, b) => a._score - b._score);
  }, [query, available]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = useCallback(
    (cmd) => {
      if (cmd.action === 'theme') {
        onAction?.('theme');
        onClose();
        return;
      }
      if (cmd.id === 'keyboard-shortcuts') {
        setShowShortcuts(true);
        return;
      }
      if (cmd.route) {
        onNavigate?.(cmd.route);
        onClose();
      }
    },
    [onAction, onClose, onNavigate],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) executeCommand(cmd);
        return;
      }

      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose, executeCommand]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
    setShowShortcuts(false);
  };

  return (
    <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-start justify-center pt-20" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-[rgb(17_24_39/0.5)]" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-2xl mx-4 animate-fade-up">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              <Command className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Type a command or search..."
              className="w-full pl-12 pr-12 py-4 text-base bg-transparent border-none focus:outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
              autoComplete="off"
              spellCheck={false}
              aria-label="Command palette search"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded font-mono text-[var(--color-text-tertiary)]">⌘K</kbd>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] max-h-[60vh] overflow-auto">
            {showShortcuts ? (
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  <span>Keyboard Shortcuts</span>
                  <button onClick={() => setShowShortcuts(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">Close</button>
                </div>
                {SHORTCUTS.map((shortcut, i) => (
                  <ShortcutItem key={i} shortcut={shortcut} />
                ))}
              </div>
            ) : filteredCommands.length > 0 ? (
              <ul className="py-2" role="listbox" aria-label="Commands">
                {filteredCommands.map((cmd, index) => (
                  <li
                    key={cmd.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                      index === selectedIndex ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-alt)]'
                    )}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <CommandIcon name={cmd.icon} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-text-primary)] truncate">{cmd.label}</span>
                        {cmd.shortcut && (
                          <Shortcut keys={cmd.shortcut.split(' ').map(k => k.trim())} />
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] truncate">{cmd.description}</p>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">{cmd.category}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <Search className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-tertiary)]" />
                <p>No commands found for "{query}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] px-4 py-2 flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
            <span>↑↓ Navigate • ⏎ Select • Esc Close</span>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              DevConnect Command Palette
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}