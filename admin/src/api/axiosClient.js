import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // gửi cookie (access_token, refresh_token) tự động
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor – tự động refresh token khi bị 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không retry cho các auth-related endpoints
      const skipUrls = ['/auth/sign-in', '/auth/sign-out', '/auth/refresh-token', '/users/profile'];
      if (skipUrls.some(url => originalRequest.url?.includes(url))) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post('/auth/refresh-token');
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
