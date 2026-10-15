import { apiClient } from '../api/client';

export const userService = {
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },
  
  updateProfile: async (data) => {
    return apiClient.patch('/users/profile', data);
  },

  getSubscription: async () => {
    return apiClient.get('/vendors/subscription/me');
  },

  renewSubscription: async (plan) => {
    return apiClient.post('/vendors/subscription/renew', { plan });
  }
};
