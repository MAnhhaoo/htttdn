import { apiClient } from './apiClient';

export const addressService = {
  getAddresses: async () => {
    return await apiClient.get('/addresses');
  },

  getAddressById: async (id) => {
    return await apiClient.get(`/addresses/${id}`);
  },

  createAddress: async (data) => {
    return await apiClient.post('/addresses', data);
  },

  updateAddress: async (id, data) => {
    return await apiClient.patch(`/addresses/${id}`, data);
  },

  deleteAddress: async (id) => {
    return await apiClient.delete(`/addresses/${id}`);
  }
};
