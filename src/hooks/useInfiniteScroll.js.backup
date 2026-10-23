import { useState, useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isLoading,
  threshold = 0.1,
  rootMargin = '200px',
}) {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isObserving, setIsObserving] = useState(false);

  const sentinel = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (node && hasNextPage && !isLoading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold, rootMargin }
      );
      observerRef.current.observe(node);
      setIsObserving(true);
    } else {
      setIsObserving(false);
    }
  }, [fetchNextPage, hasNextPage, isLoading, threshold, rootMargin]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { sentinel, isObserving };
}

export function useInfiniteScrollWithData({
  initialData = [],
  fetchPage,
  getKey,
  pageSize = 20,
}) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const isFirstLoad = useRef(true);

  const loadPage = useCallback(async (pageNum, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result = await fetchPage(pageNum, pageSize);
      const newData = result.data || result.items || result;
      const total = result.total || result.count || newData.length;
      
      if (isInitial || pageNum === 1) {
        setData(newData);
      } else {
        setData(prev => {
          const existingKeys = new Set(prev.map(getKey));
          const uniqueNew = newData.filter(item => !existingKeys.has(getKey(item)));
          return [...prev, ...uniqueNew];
        });
      }
      
      setHasNextPage(data.length + newData.length < total);
      return { data: newData, total };
    } catch (err) {
      setError(err.message || 'Failed to load data');
      throw err;
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFirstLoad.current = false;
    }
  }, [fetchPage, pageSize, getKey, data.length]);

  useEffect(() => {
    if (isFirstLoad.current) {
      loadPage(1, true);
    }
  }, [loadPage]);

  const fetchNextPage = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPage(nextPage);
    }
  }, [page, hasNextPage, isLoading, isLoadingMore, loadPage]);

  const refresh = useCallback(() => {
    setPage(1);
    loadPage(1, true);
  }, [loadPage]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasNextPage(true);
    setError(null);
    isFirstLoad.current = true;
    loadPage(1, true);
  }, [initialData, loadPage]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    reset,
    sentinel: useInfiniteScroll({ fetchNextPage, hasNextPage, isLoading: isLoadingMore }).sentinel,
  };
}

export function InfiniteScrollList({ 
  children, 
  hasNextPage, 
  isLoadingMore, 
  sentinel,
  loadMoreLabel = "Load more",
  onLoadMore,
  renderSkeleton,
  emptyState,
}) {
  if (children.length === 0 && !isLoadingMore) {
    return emptyState || (
      <div className="text-center py-12 text-[var(--color-text-secondary)]">
        No items found
      </div>
    );
  }

  return (
    <div>
      {children}
      {hasNextPage && (
        <div ref={sentinel} className="flex items-center justify-center py-6">
          {isLoadingMore ? (
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              {renderSkeleton ? renderSkeleton() : (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
            </div>
          ) : onLoadMore ? (
            <button
              onClick={onLoadMore}
              className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              {loadMoreLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}