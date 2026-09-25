import apiClient from './apiClient';

export const categoryService = {
  /**
   * GET /api/categories
   * Lấy danh sách category (public) — phân trang, tìm kiếm.
   * @param {Object} params - { page, limit, search }
   */
  getCategories: async (params = {}) => {
    const response = await apiClient.get('/categories', { params });
    return response;
  },

  /**
   * POST /api/categories
   * Tạo category mới (Admin only).
   * @param {Object} data - { name }
   */
  createCategory: async (data) => {
    const response = await apiClient.post('/categories', data);
    return response;
  },

  /**
   * PATCH /api/categories/:id
   * Cập nhật category (Admin only).
   * @param {string} id
   * @param {Object} data - { name? }
   */
  updateCategory: async (id, data) => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response;
  },

  /**
   * DELETE /api/categories/:id
   * Xóa category (Admin only).
   */
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response;
  },
};
