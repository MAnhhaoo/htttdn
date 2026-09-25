import apiClient from './apiClient';

export const userService = {
  // ===================== ADMIN APIs =====================

  /**
   * GET /api/users
   * Danh sách user (Admin only) — phân trang, tìm kiếm, lọc.
   * @param {Object} params - { page, limit, search, role, status }
   */
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response;
  },

  /**
   * GET /api/users/options
   * Danh sách user rút gọn dùng cho dropdown/select (Admin only).
   * @param {Object} params - { search, limit }
   */
  getUserOptions: async (params = {}) => {
    const response = await apiClient.get('/users/options', { params });
    return response;
  },

  /**
   * GET /api/users/:id
   * Admin lấy chi tiết một user theo ID.
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response;
  },

  /**
   * PATCH /api/users/:id
   * Admin cập nhật user theo ID.
   * @param {string} id
   * @param {Object} data - { fullName?, email?, phone?, address?, role?, status? }
   */
  updateUser: async (id, data) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response;
  },

  /**
   * DELETE /api/users/:id
   * Admin xóa (vô hiệu hóa) user.
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  },

  // ===================== PROFILE APIs =====================

  /**
   * GET /api/users/profile
   * Lấy thông tin user đang đăng nhập.
   */
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response;
  },

  /**
   * PATCH /api/users/profile
   * Cập nhật thông tin user đang đăng nhập.
   * @param {Object} data - { fullName?, phone?, address? }
   */
  updateProfile: async (data) => {
    const response = await apiClient.patch('/users/profile', data);
    return response;
  },
};
