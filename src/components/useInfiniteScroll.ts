"use client";

import { useEffect, useRef } from "react";

type Options = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  /** Start loading this far before the sentinel reaches the viewport. */
  rootMargin?: string;
};

/**
 * Calls `onLoadMore` when the returned sentinel element scrolls into view.
 * Uses IntersectionObserver instead of scroll events: no listeners firing on every pixel scrolled.
 */
export function useInfiniteScroll({ hasMore, isLoading, onLoadMore, rootMargin = "200px" }: Options) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isLoading) onLoadMore();
      },
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, rootMargin]);

  return sentinelRef;
}
