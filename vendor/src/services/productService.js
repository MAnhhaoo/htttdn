import { apiClient } from '../api/client';

export const productService = {
  getVendorProducts: async (params = {}) => {
    return apiClient.get('/products/vendor/mine', { params });
  },
  
  getProductById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },
  
  createProduct: async (data) => {
    return apiClient.post('/products', data);
  },
  
  updateProduct: async (id, data) => {
    return apiClient.patch(`/products/${id}`, data);
  },
  
  deleteProduct: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('images', file);
    return apiClient.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

