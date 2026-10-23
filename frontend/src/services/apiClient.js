import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'x-app-role': 'client',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      error.message = error.code === 'ECONNABORTED'
        ? 'Yêu cầu quá thời gian. Vui lòng thử lại.'
        : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    }
    return Promise.reject(error);
  }
);
