import apiClient from './apiClient';

export const productService = {
  /**
   * GET /api/products
   * Lấy danh sách sản phẩm (public) — phân trang, tìm kiếm.
   * @param {Object} params - { page, limit, search, categoryId, status }
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response;
  },

  /**
   * GET /api/products/:id  (dùng slug hoặc id)
   * Lấy chi tiết sản phẩm.
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },

  /**
   * POST /api/products
   * Tạo sản phẩm mới (Seller/Vendor only).
   * @param {Object} data - { name, description?, status?, category: { connect: { id } } }
   */
  createProduct: async (data) => {
    const response = await apiClient.post('/products', data);
    return response;
  },

  /**
   * PATCH /api/products/:id
   * Cập nhật sản phẩm (Seller/Vendor only).
   * @param {string} id
   * @param {Object} data - { name?, description?, status?, category? }
   */
  updateProduct: async (id, data) => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response;
  },

  /**
   * DELETE /api/products/:id
   * Xóa sản phẩm (Seller/Vendor only).
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response;
  },
};
