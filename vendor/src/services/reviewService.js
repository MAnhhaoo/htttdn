import { apiClient } from '../api/client';

export const reviewService = {
  getReviewsByProduct: async (productId) => {
    return apiClient.get(`/reviews/product/${productId}`);
  }
};
