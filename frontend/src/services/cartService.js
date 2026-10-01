import { apiClient } from './apiClient';

export const cartService = {
  getCart: async () => {
    return await apiClient.get('/cart');
  },
  
  addToCart: async (productVariantId, quantity = 1) => {
    return await apiClient.post('/cart/items', { productVariantId, quantity });
  },

  updateQuantity: async (id, quantity) => {
    return await apiClient.patch(`/cart/items/${id}`, { quantity });
  },

  removeItem: async (id) => {
    return await apiClient.delete(`/cart/items/${id}`);
  }
};
