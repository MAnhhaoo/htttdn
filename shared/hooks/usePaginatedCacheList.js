import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom Hook dùng chung cho các trang quản lý danh sách phân trang (Admin / Vendor / Employee):
 * - Tự động debounce từ khóa tìm kiếm (mặc định 300ms).
 * - Lưu bộ nhớ đệm (Cache) cho danh sách gốc ở trang 1 (khi không tìm kiếm / không lọc).
 * - Tự động làm mới khi nhận sự kiện Realtime.
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
  const [rawData, setRawData] = useState(null);
  const [reusedFromCache, setReusedFromCache] = useState(false);

  const defaultListCacheRef = useRef(null);
  const extraParamsJson = JSON.stringify(extraParams);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

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
        setRawData(cached.rawData);
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
        const data = res?.data?.data ?? res?.data ?? res ?? {};
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
        setRawData(data);

        if (isDefaultQuery) {
          defaultListCacheRef.current = {
            list: nextList,
            totalPages: nextTotalPages,
            totalItems: nextTotalItems,
            rawData: data,
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
    const events = Array.isArray(realtimeEvent) ? realtimeEvent : [realtimeEvent];
    const handleRealtime = () => fetchList(true);
    events.forEach((ev) => window.addEventListener(ev, handleRealtime));
    return () => events.forEach((ev) => window.removeEventListener(ev, handleRealtime));
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
      setRawData(cached.rawData);
      setReusedFromCache(true);
    }
  }, []);

  return {
    list,
    setList,
    rawData,
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

