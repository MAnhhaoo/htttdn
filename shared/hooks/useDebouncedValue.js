import { useState, useEffect } from 'react';

/**
 * Trì hoãn cập nhật giá trị tìm kiếm/lọc nhằm tránh bắn API liên tục trên từng phím gõ.
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default useDebouncedValue;

