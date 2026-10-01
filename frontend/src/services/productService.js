import { apiClient } from './apiClient';

export const productService = {
  getProducts: async (params = {}) => {
    return await apiClient.get('/products', { params });
  },

  getProductsByCategory: async (categorySlug, params = {}) => {
    return await apiClient.get(`/products/category/${categorySlug}`, { params });
  },

  getProductById: async (id) => {
    return await apiClient.get(`/products/${id}`);
  }
};
