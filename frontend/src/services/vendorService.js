import { apiClient } from './apiClient';

export const vendorService = {
  getPublicProfile: async (id) => {
    return await apiClient.get(`/vendors/public/${id}`);
  },
};
