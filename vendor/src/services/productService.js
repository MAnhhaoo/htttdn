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
  }
};
