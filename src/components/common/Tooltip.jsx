import { useState, useRef, useEffect, useContext, createContext, useCallback } from 'react';
import { cn } from '../../utils/cn';

export const TooltipContext = createContext(null);

export function TooltipProvider({ children }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  return (
    <TooltipContext.Provider value={{ activeTooltip, setActiveTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return context;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  disabled = false,
  className = '',
  maxWidth = '200px',
  sideOffset = 8,
  showArrow = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const padding = sideOffset;
    
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'top':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - padding;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.bottom + padding;
        break;
      case 'left':
        x = trigger.left - tooltip.width - padding;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case 'right':
        x = trigger.right + padding;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case 'top-left':
        x = trigger.left;
        y = trigger.top - tooltip.height - padding;
        break;
      case 'top-right':
        x = trigger.right - tooltip.width;
        y = trigger.top - tooltip.height - padding;
        break;
      default:
        break;
    }
    
    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (x < 10) x = 10;
    if (x + tooltip.width > viewportWidth - 10) x = viewportWidth - tooltip.width - 10;
    if (y < 10) y = 10;
    if (y + tooltip.height > viewportHeight - 10) y = viewportHeight - tooltip.height - 10;
    
    setCoords({ x, y });
  }, [position, sideOffset]);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(calculatePosition, 0);
    }, delay);
  }, [disabled, delay, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getArrowClasses = () => {
    const arrowBase = 'absolute w-2 h-2 bg-[var(--color-surface)] border-[var(--color-border)] transform rotate-45';
    switch (position) {
      case 'top': return cn(arrowBase, 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b');
      case 'bottom': return cn(arrowBase, 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t');
      case 'left': return cn(arrowBase, 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r');
      case 'right': return cn(arrowBase, 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l');
      default: return cn(arrowBase, 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b');
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={cn('inline-flex', className)}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </span>
      
      {isVisible && content && (
        <div
          id="tooltip"
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'fixed z-[var(--z-index-tooltip)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg animate-fade-in',
            'pointer-events-none'
          )}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            maxWidth,
          }}
        >
          {content}
          {showArrow && (
            <span className={getArrowClasses()} />
          )}
        </div>
      )}
    </>
  );
}

export function HelpText({
  children,
  title,
  content,
  className = '',
  ...props
}) {
  return (
    <Tooltip content={content || title} {...props}>
      <span className={cn('inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-gray-200)] text-[var(--color-text-tertiary)] text-[10px] cursor-help', className)} aria-label="Help">
        ?
      </span>
    </Tooltip>
  );
}

export function HelpOverlay({ isOpen, onClose, sections = [] }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Help">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="relative w-full max-w-3xl mx-4 max-h-[80vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Help & Documentation</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
            aria-label="Close help"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{section.title}</h3>
                <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-primary)] mt-1">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}