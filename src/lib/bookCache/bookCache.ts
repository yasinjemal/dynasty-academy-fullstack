/**
 * 🚀 BOOK CACHE - OFFLINE-SPEED READING EXPERIENCE
 *
 * This system makes book reading feel INSTANT like an offline app:
 * - IndexedDB for persistent caching
 * - Aggressive preloading (5 pages ahead + 2 behind)
 * - Instant page turns with no loading
 * - Background sync for seamless updates
 */

interface CachedPage {
  bookId: string;
  pageNumber: number;
  content: string;
  formattedHtml: string;
  wordCount: number;
  cachedAt: number;
  expiresAt: number;
}

interface BookMetadata {
  bookId: string;
  slug: string;
  totalPages: number;
  lastRead: number;
  cachedPages: number[];
}

class BookCacheManager {
  private dbName = "DynastyBookCache";
  private version = 1;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === "undefined") return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create pages store
        if (!db.objectStoreNames.contains("pages")) {
          const pagesStore = db.createObjectStore("pages", {
            keyPath: ["bookId", "pageNumber"],
          });
          pagesStore.createIndex("bookId", "bookId", { unique: false });
          pagesStore.createIndex("expiresAt", "expiresAt", { unique: false });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains("metadata")) {
          const metaStore = db.createObjectStore("metadata", {
            keyPath: "bookId",
          });
          metaStore.createIndex("lastRead", "lastRead", { unique: false });
        }
      };
    });
  }

  /**
   * Get page from cache (instant!)
   */
  async getPage(
    bookId: string,
    pageNumber: number
  ): Promise<CachedPage | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["pages"], "readonly");
      const store = tx.objectStore("pages");
      const request = store.get([bookId, pageNumber]);

      request.onsuccess = () => {
        const page = request.result as CachedPage;
        if (page && page.expiresAt > Date.now()) {
          resolve(page);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Cache a page for instant access
   */
  async cachePage(page: CachedPage): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["pages", "metadata"], "readwrite");
      const pagesStore = tx.objectStore("pages");
      const metaStore = tx.objectStore("metadata");

      // Save page
      pagesStore.put(page);

      // Update metadata
      const metaRequest = metaStore.get(page.bookId);
      metaRequest.onsuccess = () => {
        const meta: BookMetadata = metaRequest.result || {
          bookId: page.bookId,
          slug: "",
          totalPages: 0,
          lastRead: Date.now(),
          cachedPages: [],
        };

        if (!meta.cachedPages.includes(page.pageNumber)) {
          meta.cachedPages.push(page.pageNumber);
          meta.cachedPages.sort((a, b) => a - b);
        }
        meta.lastRead = Date.now();

        metaStore.put(meta);
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get multiple pages at once
   */
  async getPages(
    bookId: string,
    pageNumbers: number[]
  ): Promise<Map<number, CachedPage>> {
    const result = new Map<number, CachedPage>();

    for (const pageNum of pageNumbers) {
      const page = await this.getPage(bookId, pageNum);
      if (page) {
        result.set(pageNum, page);
      }
    }

    return result;
  }

  /**
   * Preload multiple pages in background
   */
  async preloadPages(
    bookId: string,
    slug: string,
    pageNumbers: number[]
  ): Promise<void> {
    // Fetch all pages in parallel
    const fetchPromises = pageNumbers.map(async (pageNum) => {
      // Skip if already cached
      const cached = await this.getPage(bookId, pageNum);
      if (cached) return;

      try {
        const res = await fetch(`/api/books/${slug}/read?page=${pageNum}`);
        if (!res.ok) return;

        const data = await res.json();
        const wordCount = data.content
          .replace(/<[^>]*>/g, "")
          .split(/\s+/).length;

        await this.cachePage({
          bookId,
          pageNumber: pageNum,
          content: data.content,
          formattedHtml: data.content, // Will be formatted on use
          wordCount,
          cachedAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        console.log(`🚀 Preloaded page ${pageNum} for ${slug}`);
      } catch (error) {
        console.warn(`Failed to preload page ${pageNum}:`, error);
      }
    });

    await Promise.allSettled(fetchPromises);
  }

  /**
   * Get book metadata
   */
  async getMetadata(bookId: string): Promise<BookMetadata | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(["metadata"], "readonly");
      const store = tx.objectStore("metadata");
      const request = store.get(bookId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Clear expired pages
   */
  async clearExpired(): Promise<number> {
    if (!this.db) await this.init();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(["pages"], "readwrite");
      const store = tx.objectStore("pages");
      const index = store.index("expiresAt");
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

      let deleted = 0;
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log(`🧹 Cleared ${deleted} expired pages`);
        resolve(deleted);
      };
    });
  }

  /**
   * Clear all cache for a book
   */
  async clearBook(bookId: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(["pages", "metadata"], "readwrite");
      const pagesStore = tx.objectStore("pages");
      const metaStore = tx.objectStore("metadata");

      // Delete all pages for book
      const index = pagesStore.index("bookId");
      const request = index.openCursor(IDBKeyRange.only(bookId));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Delete metadata
      metaStore.delete(bookId);

      tx.oncomplete = () => resolve();
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalPages: number;
    totalSize: number;
    oldestCache: number;
  }> {
    if (!this.db) await this.init();
    if (!this.db)
      return { totalPages: 0, totalSize: 0, oldestCache: Date.now() };

    return new Promise((resolve) => {
      const tx = this.db!.transaction(["pages"], "readonly");
      const store = tx.objectStore("pages");
      const request = store.openCursor();

      let count = 0;
      let size = 0;
      let oldest = Date.now();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const page = cursor.value as CachedPage;
          count++;
          size += page.content.length + page.formattedHtml.length;
          if (page.cachedAt < oldest) oldest = page.cachedAt;
          cursor.continue();
        }
      };

      tx.oncomplete = () =>
        resolve({
          totalPages: count,
          totalSize: size,
          oldestCache: oldest,
        });
    });
  }
}

// Singleton instance
export const bookCache = new BookCacheManager();

/**
 * Hook for smart page preloading
 * Preloads pages based on reading direction
 */
export function getPreloadPageNumbers(
  currentPage: number,
  totalPages: number,
  direction: "forward" | "backward" | "both" = "forward"
): number[] {
  const pages: number[] = [];

  if (direction === "forward" || direction === "both") {
    // Preload next 5 pages
    for (let i = 1; i <= 5; i++) {
      const page = currentPage + i;
      if (page <= totalPages) pages.push(page);
    }
  }

  if (direction === "backward" || direction === "both") {
    // Preload previous 2 pages
    for (let i = 1; i <= 2; i++) {
      const page = currentPage - i;
      if (page >= 1) pages.push(page);
    }
  }

  return pages;
}
