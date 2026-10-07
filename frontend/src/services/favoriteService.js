import { apiClient } from './apiClient';

export const favoriteService = {
  getFavorites: async () => {
    return apiClient.get('/products/favorites');
  },
  addFavorite: async (productId) => {
    return apiClient.post(`/products/${productId}/favorite`);
  },
  removeFavorite: async (productId) => {
    return apiClient.delete(`/products/${productId}/favorite`);
  }
};
