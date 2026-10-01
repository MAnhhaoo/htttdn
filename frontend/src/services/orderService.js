import { apiClient } from './apiClient';

export const orderService = {
  createOrder: async (data) => {
    return await apiClient.post('/orders', data);
  },
  
  getOrders: async (params = {}) => {
    return await apiClient.get('/orders/mine', { params });
  },

  getOrderById: async (id) => {
    return await apiClient.get(`/orders/${id}`);
  }
};
