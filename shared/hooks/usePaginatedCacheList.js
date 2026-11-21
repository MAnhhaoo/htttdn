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
  const requestIdRef = useRef(0);
  const prevFilterKeyRef = useRef(null);
  const extraParamsJson = JSON.stringify(extraParams);
  const filterKey = `${debouncedSearch}|${extraParamsJson}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const fetchList = useCallback(
    async (forceRefresh = false, pageOverride = null) => {
      const targetPage = pageOverride ?? page;
      const isDefaultQuery =
        targetPage === 1 && !debouncedSearch && Boolean(isDefaultExtraParams);

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

      const currentReqId = ++requestIdRef.current;
      setLoading(true);
      setReusedFromCache(false);
      try {
        const parsedExtra = JSON.parse(extraParamsJson);
        const params = {
          page: targetPage,
          itemPerPage: itemsPerPage,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...parsedExtra,
        };
        const res = await fetcher(params);
        if (currentReqId !== requestIdRef.current) return;
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
        if (currentReqId === requestIdRef.current) {
          console.error('Error fetching paginated list:', err);
        }
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [page, itemsPerPage, debouncedSearch, isDefaultExtraParams, extraParamsJson, fetcher],
  );

  useEffect(() => {
    const filterChanged =
      prevFilterKeyRef.current !== null && prevFilterKeyRef.current !== filterKey;
    prevFilterKeyRef.current = filterKey;
    if (filterChanged && page !== 1) {
      setPage(1);
      return;
    }
    fetchList(false);
  }, [fetchList, filterKey, page]);

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

