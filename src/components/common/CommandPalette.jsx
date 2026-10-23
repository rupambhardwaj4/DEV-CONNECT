import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Search, ChevronRight, ExternalLink, Zap, Users, Code2, Briefcase, GitBranch, Settings, Bookmark, Bell, Plus, HelpCircle, Moon, Sun, Keyboard, Command } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', '⇧', 'K'], description: 'Show keyboard shortcuts' },
  { keys: ['⌘', '/'], description: 'Focus search' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
  { keys: ['⌘', 'D'], description: 'Toggle theme' },
  { keys: ['G', 'D'], description: 'Go to dashboard' },
  { keys: ['G', 'P'], description: 'Go to projects' },
  { keys: ['G', 'J'], description: 'Go to jobs' },
  { keys: ['G', 'C'], description: 'Go to connections' },
  { keys: ['G', 'N'], description: 'Go to notifications' },
  { keys: ['G', 'S'], description: 'Go to settings' },
  { keys: ['G', 'H'], description: 'Go to home/landing' },
  { keys: ['?'], description: 'Show help' },
];

const COMMANDS = [
  { id: 'dashboard', label: 'Dashboard', description: 'View your personalized dashboard', icon: 'layout-dashboard', shortcut: 'G D', category: 'Navigation', route: '/' },
  { id: 'developers', label: 'Developers', description: 'Browse and connect with developers', icon: 'users', shortcut: 'G C', category: 'Navigation', route: '/developers' },
  { id: 'projects', label: 'Projects', description: 'Explore and showcase projects', icon: 'code', shortcut: 'G P', category: 'Navigation', route: '/projects' },
  { id: 'jobs', label: 'Jobs', description: 'Discover job opportunities', icon: 'briefcase', shortcut: 'G J', category: 'Navigation', route: '/jobs' },
  { id: 'connections', label: 'Connections', description: 'Manage your network', icon: 'git-branch', shortcut: 'G N', category: 'Navigation', route: '/connections' },
  { id: 'notifications', label: 'Notifications', description: 'View your notifications', icon: 'bell', shortcut: 'G N', category: 'Navigation', route: '/notifications' },
  { id: 'recommendations', label: 'Recommendations', description: 'Personalized recommendations', icon: 'zap', shortcut: '', category: 'Navigation', route: '/recommendations' },
  { id: 'settings', label: 'Settings', description: 'Manage your account settings', icon: 'settings', shortcut: 'G S', category: 'Account', route: '/settings' },
  { id: 'profile', label: 'My Profile', description: 'View and edit your profile', icon: 'user', shortcut: '', category: 'Account', route: '/profile' },
  { id: 'profile-edit', label: 'Edit Profile', description: 'Update your profile information', icon: 'edit', shortcut: '', category: 'Account', route: '/profile/edit' },
  { id: 'new-project', label: 'Create New Project', description: 'Add a new project to your portfolio', icon: 'plus', shortcut: '', category: 'Actions', route: '/projects/new' },
  { id: 'saved-jobs', label: 'Saved Jobs', description: 'View your saved job listings', icon: 'bookmark', shortcut: '', category: 'Actions', route: '/jobs/saved' },
  { id: 'my-applications', label: 'My Applications', description: 'Track your job applications', icon: 'file-text', shortcut: '', category: 'Actions', route: '/applications' },
  { id: 'onboarding', label: 'Complete Onboarding', description: 'Finish setting up your profile', icon: 'user-plus', shortcut: '', category: 'Actions', route: '/onboarding' },
  { id: 'theme-toggle', label: 'Toggle Theme', description: 'Switch between light and dark mode', icon: 'moon', shortcut: '⌘ D', category: 'Preferences', action: 'theme-toggle' },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', description: 'View all available shortcuts', icon: 'keyboard', shortcut: '⌘ ⇧ K', category: 'Help', action: 'shortcuts' },
  { id: 'help', label: 'Help & Documentation', description: 'Get help and read documentation', icon: 'help-circle', shortcut: '?', category: 'Help', action: 'help' },
  { id: 'search-developers', label: 'Search Developers', description: 'Find developers by skills, location', icon: 'search', shortcut: '⌘ /', category: 'Search', action: 'search-developers' },
  { id: 'search-projects', label: 'Search Projects', description: 'Find projects by technology', icon: 'search', shortcut: '', category: 'Search', action: 'search-projects' },
  { id: 'search-jobs', label: 'Search Jobs', description: 'Find jobs by title, company', icon: 'search', shortcut: '', category: 'Search', action: 'search-jobs' },
];

const ICONS = {
  'layout-dashboard': <div className="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></div>,
  'users': <Users className="h-4 w-4" />,
  'code': <Code2 className="h-4 w-4" />,
  'briefcase': <Briefcase className="h-4 w-4" />,
  'git-branch': <GitBranch className="h-4 w-4" />,
  'bell': <Bell className="h-4 w-4" />,
  'zap': <Zap className="h-4 w-4" />,
  'settings': <Settings className="h-4 w-4" />,
  'user': <div className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 3-8 7v1h16v-1c0-4-3-7-8-7"/></div>,
  'edit': <div className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></div>,
  'plus': <Plus className="h-4 w-4" />,
  'bookmark': <Bookmark className="h-4 w-4" />,
  'file-text': <div className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></div>,
  'user-plus': <div className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></div>,
  'moon': <Moon className="h-4 w-4" />,
  'keyboard': <Keyboard className="h-4 w-4" />,
  'help-circle': <HelpCircle className="h-4 w-4" />,
  'search': <Search className="h-4 w-4" />,
  'sun': <Sun className="h-4 w-4" />,
  'command': <Command className="h-4 w-4" />,
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

export function CommandPalette({ isOpen, onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredCommands = useMemo(() => {
    if (!query) return COMMANDS;
    
    const lowerQuery = query.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(lowerQuery)) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      (cmd.id && cmd.id.toLowerCase().includes(lowerQuery))
    ).map((cmd, index) => ({
      ...cmd,
      _score: cmd.label.toLowerCase().startsWith(lowerQuery) ? 0 : 
              cmd.label.toLowerCase().includes(lowerQuery) ? 1 : 2
    })).sort((a, b) => a._score - b._score);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setShowShortcuts(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  const executeCommand = (cmd) => {
    if (cmd.action === 'theme-toggle') {
      onAction?.('theme-toggle');
    } else if (cmd.action === 'shortcuts') {
      setShowShortcuts(true);
      return;
    } else if (cmd.action === 'help') {
      onAction?.('help');
    } else if (cmd.action?.startsWith('search-')) {
      onAction?.(cmd.action);
    } else if (cmd.route) {
      onNavigate?.(cmd.route);
    }
    onClose();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
    setShowShortcuts(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-start justify-center pt-20" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
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