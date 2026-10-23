import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Search, X, Loader2, Filter, Clock, TrendingUp } from 'lucide-react';

export function SmartSearch({
  onSearch,
  onSelect,
  placeholder = 'Search...',
  delay = 300,
  minLength = 2,
  showSuggestions = true,
  className = '',
  autoFocus = false,
  disabled = false,
  filters = [],
  recentSearches = [],
  popularSearches = [],
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilters, setActiveFilters] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const timeoutRef = useRef(null);

  const debouncedSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < minLength) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await onSearch(searchQuery);
      setSuggestions(results || []);
      setIsOpen(results && results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, minLength]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length === 0) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.length >= minLength) {
        e.preventDefault();
        debouncedSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        } else if (query.length >= minLength) {
          debouncedSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    setQuery(item.displayName || item.name || item.value || '');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Filter chips */}
      {filters.length > 0 && activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 animate-fade-up">
          {activeFilters.map(filter => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              {filter}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() => setActiveFilters([])}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
            'transition-all duration-200',
            'placeholder-[var(--color-text-tertiary)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-surface-alt)] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-[var(--color-text-tertiary)]" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {/* Dropdown with suggestions, recent searches, and filters */}
      {isOpen && showSuggestions && (
        <div className="absolute z-[var(--z-index-dropdown)] top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl max-h-80 overflow-auto animate-scale-in backdrop-blur-sm">
          
          {/* Show recent/popular searches when no query */}
          {!query && (recentSearches.length > 0 || popularSearches.length > 0) && (
            <div className="p-3 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 3).map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(search);
                          debouncedSearch(search);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text-secondary)]"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {popularSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                    <TrendingUp className="h-3 w-3" />
                    Popular Searches
                  </div>
                  <div className="space-y-1">
                    {popularSearches.slice(0, 5).map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(search);
                          debouncedSearch(search);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text-secondary)]"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggestions list */}
          {query && suggestions.length > 0 && (
            <ul ref={listRef} className="py-2" role="listbox">
              {suggestions.map((item, index) => (
                <li
                  key={item.id || index}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150',
                    index === selectedIndex
                      ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 text-[var(--color-primary)]'
                      : 'hover:bg-[var(--color-surface-alt)]'
                  )}
                  onClick={() => handleSelect(item)}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 text-[var(--color-text-tertiary)]">
                      {item.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-text-primary)] truncate">
                      {item.displayName || item.name || item.value}
                    </div>
                    {item.description && (
                      <div className="text-xs text-[var(--color-text-secondary)] truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.category && (
                    <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]">
                      {item.category}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* No results */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 text-[var(--color-text-tertiary)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                No results found for "<span className="font-medium">{query}</span>"
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}