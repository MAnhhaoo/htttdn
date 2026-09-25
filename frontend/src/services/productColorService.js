import apiClient from './apiClient';

export const productColorService = {
  /**
   * GET /api/productColors/product/:productId
   * Lấy danh sách màu sắc của một sản phẩm.
   */
  getColorsByProductId: async (productId) => {
    const response = await apiClient.get(`/productColors/product/${productId}`);
    return response;
  },

  /**
   * GET /api/productColors/:id
   * Lấy chi tiết một màu sản phẩm.
   */
  getColorById: async (id) => {
    const response = await apiClient.get(`/productColors/${id}`);
    return response;
  },

  /**
   * POST /api/productColors
   * Tạo màu mới cho sản phẩm (Seller only).
   * Gửi FormData vì có upload ảnh.
   * @param {Object} data - { productId, color }
   * @param {File[]} imageFiles - Mảng các file ảnh
   */
  createProductColor: async (data, imageFiles = []) => {
    const formData = new FormData();
    formData.append('productId', data.productId);
    formData.append('color', data.color);

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post('/productColors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  /**
   * PATCH /api/productColors/:id
   * Cập nhật màu sản phẩm (Seller only).
   * Nếu upload ảnh mới => thay toàn bộ ảnh cũ.
   * @param {string} id
   * @param {Object} data - { color? }
   * @param {File[]} imageFiles - Ảnh mới (nếu có)
   */
  updateProductColor: async (id, data, imageFiles = []) => {
    const formData = new FormData();
    if (data.color) formData.append('color', data.color);

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.patch(`/productColors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  /**
   * POST /api/productColors/:id/images
   * Thêm ảnh mới mà giữ nguyên ảnh cũ (Seller only).
   * @param {string} id
   * @param {File[]} imageFiles
   */
  addImages: async (id, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post(`/productColors/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  /**
   * PATCH /api/productColors/:id/restore
   * Khôi phục màu đã xóa mềm (Seller only).
   */
  restoreProductColor: async (id) => {
    const response = await apiClient.patch(`/productColors/${id}/restore`);
    return response;
  },

  /**
   * DELETE /api/productColors/:id
   * Xóa mềm màu sản phẩm (Seller only).
   */
  deleteProductColor: async (id) => {
    const response = await apiClient.delete(`/productColors/${id}`);
    return response;
  },
};
