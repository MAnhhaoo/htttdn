import { apiClient } from '../api/client';

export const dashboardService = {
  getProducts: async () => {
    // We will fetch up to 100 products for dashboard aggregation, or backend should provide an analytics endpoint
    // Since we don't have analytics endpoint, we fetch the lists and aggregate locally for now
    return apiClient.get('/products/vendor/mine?itemPerPage=100');
  },
  
  getOrders: async () => {
    return apiClient.get('/orders/vendor/mine');
  }
};
