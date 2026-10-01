import { apiClient } from './apiClient';

export const categoryService = {
  getCategories: async (params = {}) => {
    return await apiClient.get('/categories', { params });
  }
};
