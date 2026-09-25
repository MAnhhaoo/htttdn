import apiClient from './apiClient';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  /**
   * POST /api/auth/sign-in
   * Backend trả về: { data: { accessToken, refreshToken } }
   * Token cũng được lưu vào cookie bởi BE.
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/sign-in', credentials);
    // response đã qua interceptor => response = response.data gốc
    const token = response?.data?.accessToken;
    if (!token) {
      throw new Error('No token received from server');
    }
    const user = jwtDecode(token);
    return { user, token };
  },

  /**
   * POST /api/auth/sign-up
   * Body: { email, password, fullName, address?, phone?, role? }
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/sign-up', userData);
    return response;
  },

  /**
   * POST /api/auth/refresh-token
   * Dùng refresh token từ cookie để lấy cặp token mới.
   */
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh-token');
    const token = response?.data?.accessToken;
    if (token) {
      const user = jwtDecode(token);
      return { user, token };
    }
    return response;
  },

  /**
   * POST /api/auth/sign-out
   * Backend xóa cookie access_token và refresh_token.
   */
  logout: async () => {
    const response = await apiClient.post('/auth/sign-out');
    return response;
  },
};
