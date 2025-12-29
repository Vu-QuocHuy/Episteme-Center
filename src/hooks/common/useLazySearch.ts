import { useState, useEffect, useCallback, useRef } from 'react';

export interface LazySearchOptions<T> {
  /**
   * Function to fetch data from API
   * @param params - Search parameters including page, limit, and search query
   * @returns Promise with API response containing data array and metadata
   */
  fetchFn: (params: {
    page: number;
    limit: number;
    searchQuery?: string;
    [key: string]: any;
  }) => Promise<{
    data?: {
      data?: {
        result?: T[];
        meta?: {
          totalPages?: number;
          totalItems?: number;
          currentPage?: number;
        };
      };
      result?: T[];
      meta?: {
        totalPages?: number;
        totalItems?: number;
        currentPage?: number;
      };
    };
    result?: T[];
    meta?: {
      totalPages?: number;
      totalItems?: number;
      currentPage?: number;
    };
  }>;
  
  /**
   * Debounce delay in milliseconds (default: 500ms)
   */
  debounceDelay?: number;
  
  /**
   * Number of items per page (default: 10)
   */
  pageSize?: number;
  
  /**
   * Whether to load initial suggestions when enabled becomes true
   */
  loadOnMount?: boolean;
  
  /**
   * Whether the search is enabled (e.g., dialog is open)
   */
  enabled?: boolean;
  
  /**
   * Additional parameters to pass to fetchFn
   */
  additionalParams?: Record<string, any>;
  
  /**
   * Transform function to convert API response to desired format
   */
  transformFn?: (item: any) => T;
}

export interface LazySearchReturn<T> {
  /** Current search query */
  searchQuery: string;
  
  /** Function to update search query */
  setSearchQuery: (query: string) => void;
  
  /** Debounced search query */
  debouncedSearch: string;
  
  /** List of items */
  items: T[];
  
  /** Whether data is currently loading */
  loading: boolean;
  
  /** Whether more data is available */
  hasMore: boolean;
  
  /** Current page number */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Error message if any */
  error: string | null;
  
  /** Function to load more items (for lazy loading) */
  loadMore: () => void;
  
  /** Function to reset search and clear items */
  reset: () => void;
  
  /** Function to refresh current page */
  refresh: () => void;
}

/**
 * Custom hook for lazy loading search with debouncing
 * Combines debouncing for search input and lazy loading for results
 * 
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   items,
 *   loading,
 *   hasMore,
 *   loadMore
 * } = useLazySearch({
 *   fetchFn: async (params) => {
 *     const res = await getAllClassesAPI(params);
 *     return res.data;
 *   },
 *   enabled: openDialog,
 *   loadOnMount: true,
 *   pageSize: 10
 * });
 * ```
 */
export function useLazySearch<T = any>(options: LazySearchOptions<T>): LazySearchReturn<T> {
  const {
    fetchFn,
    debounceDelay = 500,
    pageSize = 10,
    loadOnMount = false,
    enabled = true,
    additionalParams = {},
    transformFn
  } = options;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  
  const isInitialLoad = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    if (!enabled) return;
    
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search query changes
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
        setItems([]);
      }
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [searchQuery, debounceDelay, enabled]);

  // Fetch data function
  const fetchData = useCallback(async (page: number, query: string, append: boolean = false) => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit: pageSize,
        ...additionalParams
      };

      // Add search query if provided
      if (query && query.trim()) {
        params.name = query.trim();
      }

      const response = await fetchFn(params);

      // Handle different API response structures
      let newItems: any[] = [];
      let meta: any = {};

      if (response?.data?.data?.result) {
        // Structure: { data: { data: { result: [], meta: {} } } }
        newItems = response.data.data.result;
        meta = response.data.data.meta || {};
      } else if (response?.data?.result) {
        // Structure: { data: { result: [], meta: {} } }
        newItems = response.data.result;
        meta = response.data.meta || {};
      } else if (response?.data?.data) {
        // Structure: { data: { data: [] } }
        newItems = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response?.data)) {
        // Structure: { data: [] }
        newItems = response.data;
      } else if (Array.isArray(response)) {
        // Structure: []
        newItems = response;
      }

      // Transform items if transform function provided
      if (transformFn && newItems.length > 0) {
        newItems = newItems.map(transformFn);
      }

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      const totalPagesCount = meta.totalPages || Math.ceil((meta.totalItems || newItems.length) / pageSize);
      setTotalPages(totalPagesCount);
      setHasMore(page < totalPagesCount && newItems.length === pageSize);
      setCurrentPage(page);

    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      console.error('Error fetching data:', err);
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      
      if (!append) {
        setItems([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, fetchFn, pageSize, additionalParams, transformFn]);

  // Load initial suggestions when enabled becomes true
  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    if (loadOnMount && isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchData(1, '', false);
    }
  }, [enabled, loadOnMount]);

  // Fetch data when debounced search changes
  useEffect(() => {
    if (!enabled) return;

    const query = debouncedSearch.trim();
    
    // If query is empty and loadOnMount is false, clear items
    if (!query && !loadOnMount) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    // Fetch data with current page (will be reset to 1 if search changed)
    fetchData(currentPage === 1 || searchQuery !== debouncedSearch ? 1 : currentPage, query, false);
  }, [debouncedSearch, enabled]);

  // Load more function for lazy loading
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !enabled) return;
    
    const nextPage = currentPage + 1;
    fetchData(nextPage, debouncedSearch, true);
  }, [loading, hasMore, enabled, currentPage, debouncedSearch, fetchData]);

  // Reset function
  const reset = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    isInitialLoad.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, debouncedSearch, false);
  }, [debouncedSearch, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    items,
    loading,
    hasMore,
    currentPage,
    totalPages,
    error,
    loadMore,
    reset,
    refresh
  };
}

