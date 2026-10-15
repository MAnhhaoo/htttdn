import { apiClient } from './apiClient';

export const reviewService = {
  createReview: async ({ orderDetailId, rating, content }) => {
    return await apiClient.post('/reviews', { orderDetailId, rating, content });
  },
  getByProduct: async (productId) => {
    return await apiClient.get(`/reviews/product/${productId}`);
  },
};
