import axios from 'axios';

// Khi dùng Vite proxy, gọi /api/** sẽ được forward tới http://localhost:3000/api/**
// Điều này tránh hoàn toàn lỗi CORS khi phát triển
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      localStorage.removeItem('token');
      // Optional: Redirect to login page or dispatch logout action
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
