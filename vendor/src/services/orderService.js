import { apiClient } from '../api/client';

export const orderService = {
  getVendorOrders: async () => {
    return apiClient.get('/orders/vendor/mine');
  },
  
  getFulfillmentOrders: async () => {
    return apiClient.get('/orders/vendor/orders');
  },
  
  getOrderById: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },
  
  updateOrderStatus: async (id, status, note = '') => {
    return apiClient.patch(`/orders/${id}/status`, { status, note });
  },

  updateVendorOrderStatus: async (id, status, note = '') => {
    return apiClient.patch(`/orders/vendor-orders/${id}/status`, { status, note });
  },
};
