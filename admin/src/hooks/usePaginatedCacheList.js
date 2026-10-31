import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom Hook dùng chung cho các trang quản lý danh sách phân trang trong Admin:
 * - Tự động debounce từ khóa tìm kiếm (mặc định 300ms).
 * - Lưu bộ nhớ đệm (Cache) cho danh sách gốc ở trang 1 (khi không tìm kiếm / không lọc).
 * - Khi người dùng xóa từ khóa tìm kiếm hoặc bấm "Khôi phục DS gốc", tái sử dụng ngay từ Cache
 *   mà không cần truy vấn lại Database.
 */
export function usePaginatedCacheList({
  fetcher,
  itemsPerPage = 10,
  debounceMs = 300,
  extraParams = {},
  isDefaultExtraParams = true,
  realtimeEvent,
}) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [reusedFromCache, setReusedFromCache] = useState(false);

  const defaultListCacheRef = useRef(null);
  const extraParamsJson = JSON.stringify(extraParams);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Reset về trang 1 khi thay đổi từ khóa tìm kiếm hoặc bộ lọc phụ
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, extraParamsJson]);

  const fetchList = useCallback(
    async (forceRefresh = false) => {
      const isDefaultQuery =
        page === 1 && !debouncedSearch && Boolean(isDefaultExtraParams);

      if (!forceRefresh && isDefaultQuery && defaultListCacheRef.current) {
        const cached = defaultListCacheRef.current;
        setList(cached.list);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        setReusedFromCache(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setReusedFromCache(false);
      try {
        const parsedExtra = JSON.parse(extraParamsJson);
        const params = {
          page,
          itemPerPage: itemsPerPage,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...parsedExtra,
        };
        const res = await fetcher(params);
        const data = res?.data ?? res ?? {};
        const nextList = Array.isArray(data.list)
          ? data.list
          : Array.isArray(data)
            ? data
            : [];
        const nextTotalPages = data.totalPages || 1;
        const nextTotalItems = data.totalItems ?? nextList.length;

        setList(nextList);
        setTotalPages(nextTotalPages);
        setTotalItems(nextTotalItems);

        if (isDefaultQuery) {
          defaultListCacheRef.current = {
            list: nextList,
            totalPages: nextTotalPages,
            totalItems: nextTotalItems,
            savedAt: new Date(),
          };
        }
      } catch (err) {
        console.error('Error fetching paginated list:', err);
      } finally {
        setLoading(false);
      }
    },
    [page, itemsPerPage, debouncedSearch, isDefaultExtraParams, extraParamsJson, fetcher],
  );

  useEffect(() => {
    fetchList(false);
  }, [fetchList]);

  useEffect(() => {
    if (!realtimeEvent) return;
    const handleRealtime = () => fetchList(true);
    window.addEventListener(realtimeEvent, handleRealtime);
    return () => window.removeEventListener(realtimeEvent, handleRealtime);
  }, [realtimeEvent, fetchList]);

  const handleResetAndReuseList = useCallback((onResetExtra) => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
    onResetExtra?.();
    if (defaultListCacheRef.current) {
      const cached = defaultListCacheRef.current;
      setList(cached.list);
      setTotalPages(cached.totalPages);
      setTotalItems(cached.totalItems);
      setReusedFromCache(true);
    }
  }, []);

  return {
    list,
    setList,
    search,
    setSearch,
    debouncedSearch,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    reusedFromCache,
    fetchList,
    handleResetAndReuseList,
  };
}

export default usePaginatedCacheList;
