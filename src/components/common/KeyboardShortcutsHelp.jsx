import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Modal } from './Modal';
import { Keyboard, X } from 'lucide-react';

const shortcutGroups = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['g', 'd'], description: 'Go to Dashboard' },
      { keys: ['g', 'p'], description: 'Go to Projects' },
      { keys: ['g', 'j'], description: 'Go to Jobs' },
      { keys: ['g', 'c'], description: 'Go to Connections' },
      { keys: ['g', 'n'], description: 'Go to Notifications' },
      { keys: ['g', 's'], description: 'Go to Settings' },
      { keys: ['g', 'h'], description: 'Go to Landing' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['⌘/Ctrl', '⇧', 'K'], description: 'Open search' },
      { keys: ['⌘/Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['⌘/Ctrl', 'D'], description: 'Toggle theme' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    title: 'Search & Command Palette',
    shortcuts: [
      { keys: ['↑', '↓'], description: 'Navigate suggestions' },
      { keys: ['Enter'], description: 'Select item' },
      { keys: ['Esc'], description: 'Close palette' },
    ],
  },
];

export function KeyboardShortcutsHelp({ isOpen: externalIsOpen, onClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Support both controlled and uncontrolled usage
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? () => {} : setInternalIsOpen;
  const handleClose = onClose || (() => setInternalIsOpen(false));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen, handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Keyboard Shortcuts"
      size="lg"
      className="max-w-2xl"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header with tip */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border border-[var(--color-border)]">
          <Keyboard className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Boost your productivity with keyboard shortcuts
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--color-surface-alt)] rounded border border-[var(--color-border)]">?</kbd> anytime to see this help menu
            </p>
          </div>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-4">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 0.05}s` }}>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors group"
                  >
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd
                            className={cn(
                              'inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-medium',
                              'bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-alt)]',
                              'border border-[var(--color-border)] rounded-md shadow-sm',
                              'text-[var(--color-text-primary)]',
                              'group-hover:border-[var(--color-primary)]/30 group-hover:shadow-md',
                              'transition-all duration-150'
                            )}
                          >
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-[var(--color-text-tertiary)] mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-center text-[var(--color-text-tertiary)]">
            Tip: These shortcuts work when you're not focused on an input field
          </p>
        </div>
      </div>
    </Modal>
  );
}

// Helper component for displaying keyboard keys
export function Kbd({ children, className = '' }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-mono font-medium',
        'bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-alt)]',
        'border border-[var(--color-border)] rounded shadow-sm',
        'text-[var(--color-text-primary)]',
        className
      )}
    >
      {children}
    </kbd>
  );
}
