import axios from 'axios';

/**
 * Factory tạo Axios Client chuẩn cho các cổng (Admin / Vendor / Employee / Frontend)
 * - Tích hợp hàng đợi tự động làm mới Access Token khi gặp lỗi 401 (failedQueue).
 * - Chuẩn hóa thông báo lỗi mạng Tiếng Việt.
 * - Hỗ trợ tùy chọn `unwrapData: true` (cho Vendor/Employee) hoặc `false` (giữ nguyên cấu trúc `{ data }` của Admin).
 */
export function createApiClient({
  role,
  baseURL = '/api',
  timeout = 15000,
  unwrapData = false,
  skipRefreshUrls = ['/auth/sign-in', '/auth/sign-out', '/auth/refresh-token'],
  onUnauthorized,
} = {}) {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(role ? { 'x-app-role': role } : {}),
    },
  });

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response) => {
      if (!unwrapData) return response;
      return response.data?.data !== undefined ? response.data.data : response.data;
    },
    async (error) => {
      if (!error.response) {
        error.message =
          error.code === 'ECONNABORTED'
            ? 'Yêu cầu quá thời gian. Vui lòng thử lại.'
            : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
      }

      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !skipRefreshUrls.some((url) => originalRequest.url?.includes(url))
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => instance(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await instance.post('/auth/refresh-token');
          processQueue(null);
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          onUnauthorized?.(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export default createApiClient;

