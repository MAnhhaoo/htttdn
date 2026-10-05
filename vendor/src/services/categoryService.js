import { apiClient } from '../api/client';

export const categoryService = {
  getAll: async () => {
    return apiClient.get('/categories');
  }
};
