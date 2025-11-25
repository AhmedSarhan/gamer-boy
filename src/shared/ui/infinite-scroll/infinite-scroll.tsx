"use client";

import { useEffect, useRef, ReactNode, useState, useCallback } from "react";
import { logger } from "@/shared/lib/logger";

interface InfiniteScrollProps<T> {
  children: (items: T[]) => ReactNode;
  initialItems: T[];
  fetchMore: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  loader?: ReactNode;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  emptyState?: ReactNode;
}

/**
 * Infinite scroll container that triggers fetchMore when user scrolls near the bottom
 */
export function InfiniteScroll<T>({
  children,
  initialItems,
  fetchMore,
  loader,
  threshold = 500,
  emptyState,
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await fetchMore(page + 1);
      setItems((prev) => [...prev, ...result.items]);
      setPage((prev) => prev + 1);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error("Error loading more items", error as Error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, fetchMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more items to load
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`, // Trigger when within threshold pixels of the sentinel
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, threshold, loadMore]);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length > 0);
    setIsLoading(false);
  }, [initialItems]);
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      {children(items)}

      {/* Sentinel element for intersection observer */}
      <div ref={observerTarget} className="h-10" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          {loader || (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <span className="text-gray-600 dark:text-gray-400">
                Loading more games...
              </span>
            </div>
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && !isLoading && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p>You&apos;ve reached the end! 🎮</p>
        </div>
      )}
    </div>
  );
}
