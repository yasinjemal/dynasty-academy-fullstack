/**
 * 🚀 USE FAST BOOK READER - OFFLINE-SPEED HOOK
 *
 * This hook makes book reading BLAZING FAST:
 * - Instant page loads from IndexedDB cache
 * - Aggressive background preloading
 * - Zero loading states for cached pages
 * - Intelligent prediction of next pages
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { bookCache, getPreloadPageNumbers } from "@/lib/bookCache/bookCache";
import { ContentFormatter } from "@/lib/bookContent/contentFormatter";

interface UseFastBookReaderOptions {
  bookId: string;
  slug: string;
  totalPages: number;
  initialPage?: number;
  readingSpeed?: number; // WPM
  onPageChange?: (page: number) => void;
  onContentLoad?: (content: string, wordCount: number) => void;
}

interface UseFastBookReaderReturn {
  currentPage: number;
  pageContent: string;
  loading: boolean;
  error: string | null;
  wordCount: number;
  estimatedReadTime: number;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  cacheStats: {
    cachedPages: number;
    cacheReady: boolean;
  };
}

export function useFastBookReader(
  options: UseFastBookReaderOptions
): UseFastBookReaderReturn {
  const {
    bookId,
    slug,
    totalPages,
    initialPage = 1,
    readingSpeed = 250,
    onPageChange,
    onContentLoad,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageContent, setPageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [cachedPages, setCachedPages] = useState<number[]>([]);
  const [cacheReady, setCacheReady] = useState(false);

  const preloadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Initialize cache on mount
  useEffect(() => {
    const initCache = async () => {
      try {
        await bookCache.init();
        setCacheReady(true);

        // Load metadata to see what's cached
        const meta = await bookCache.getMetadata(bookId);
        if (meta) {
          setCachedPages(meta.cachedPages);
        }

        console.log("🚀 Book cache initialized");
      } catch (error) {
        console.error("Failed to init cache:", error);
      }
    };

    initCache();

    return () => {
      mountedRef.current = false;
    };
  }, [bookId]);

  /**
   * Load page with cache-first strategy
   */
  const loadPage = useCallback(
    async (pageNum: number, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        // 🚀 STEP 1: Check cache FIRST (instant!)
        const cached = await bookCache.getPage(bookId, pageNum);

        if (cached) {
          // INSTANT LOAD from cache! 🎉
          const formatted = ContentFormatter.format(cached.content);
          setPageContent(formatted.html);
          setWordCount(cached.wordCount);
          setEstimatedReadTime(Math.ceil(cached.wordCount / readingSpeed));
          setLoading(false);

          onContentLoad?.(formatted.html, cached.wordCount);
          console.log(`⚡ Page ${pageNum} loaded from cache (INSTANT!)`);

          // Update cache in background if old
          const age = Date.now() - cached.cachedAt;
          if (age > 12 * 60 * 60 * 1000) {
            // Older than 12 hours
            fetchAndCache(pageNum, false); // Silent refresh
          }

          return;
        }

        // STEP 2: Fetch from API (first time only)
        await fetchAndCache(pageNum, true);
      } catch (err) {
        console.error(`Failed to load page ${pageNum}:`, err);
        setError("Failed to load page. Please try again.");
        setLoading(false);
      }
    },
    [bookId, readingSpeed, onContentLoad]
  );

  /**
   * Fetch from API and cache
   */
  const fetchAndCache = async (
    pageNum: number,
    updateUI: boolean
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/books/${slug}/read?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch page");

      const data = await res.json();
      const wordCount = data.content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length;

      // Cache it for next time
      await bookCache.cachePage({
        bookId,
        pageNumber: pageNum,
        content: data.content,
        formattedHtml: data.content,
        wordCount,
        cachedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      // Update cached pages list
      setCachedPages((prev) =>
        [...prev, pageNum]
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => a - b)
      );

      if (updateUI) {
        const formatted = ContentFormatter.format(data.content);
        setPageContent(formatted.html);
        setWordCount(wordCount);
        setEstimatedReadTime(Math.ceil(wordCount / readingSpeed));
        setLoading(false);
        onContentLoad?.(formatted.html, wordCount);
        console.log(`📥 Page ${pageNum} fetched and cached`);
      } else {
        console.log(`🔄 Page ${pageNum} refreshed in cache (background)`);
      }
    } catch (err) {
      if (updateUI) {
        throw err;
      } else {
        console.warn(`Background refresh failed for page ${pageNum}`);
      }
    }
  };

  /**
   * Intelligent preloading
   */
  const preloadNextPages = useCallback(
    async (fromPage: number) => {
      if (preloadingRef.current || !cacheReady) return;
      preloadingRef.current = true;

      try {
        const pagesToPreload = getPreloadPageNumbers(
          fromPage,
          totalPages,
          "forward"
        );

        // Filter out already cached pages
        const uncached = pagesToPreload.filter((p) => !cachedPages.includes(p));

        if (uncached.length > 0) {
          console.log(`🎯 Preloading ${uncached.length} pages:`, uncached);
          await bookCache.preloadPages(bookId, slug, uncached);

          // Update cached pages list
          if (mountedRef.current) {
            setCachedPages((prev) =>
              [...prev, ...uncached]
                .filter((v, i, a) => a.indexOf(v) === i)
                .sort((a, b) => a - b)
            );
          }
        }
      } catch (error) {
        console.warn("Preloading failed:", error);
      } finally {
        preloadingRef.current = false;
      }
    },
    [bookId, slug, totalPages, cachedPages, cacheReady]
  );

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages) return;
      if (page === currentPage) return;

      setCurrentPage(page);
      await loadPage(page);
      onPageChange?.(page);

      // Preload next pages in background
      setTimeout(() => preloadNextPages(page), 500);
    },
    [currentPage, totalPages, loadPage, onPageChange, preloadNextPages]
  );

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  /**
   * Navigate to previous page
   */
  const previousPage = useCallback(async () => {
    if (currentPage > 1) {
      await goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Load initial page
  useEffect(() => {
    if (cacheReady) {
      loadPage(currentPage);
      // Start preloading immediately
      setTimeout(() => preloadNextPages(currentPage), 1000);
    }
  }, [cacheReady]); // Only run once when cache is ready

  // Clean up expired cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      bookCache.clearExpired();
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    currentPage,
    pageContent,
    loading,
    error,
    wordCount,
    estimatedReadTime,
    goToPage,
    nextPage,
    previousPage,
    cacheStats: {
      cachedPages: cachedPages.length,
      cacheReady,
    },
  };
}
