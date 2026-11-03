import { apiClient } from '../api/client';

export const userService = {
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },
  
  updateProfile: async (data) => {
    return apiClient.patch('/users/profile', data);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data?.url || res?.url;
  },

  getSubscription: async () => {
    return apiClient.get('/vendors/subscription/me');
  },

  renewSubscription: async (plan) => {
    return apiClient.post('/vendors/subscription/renew', { plan });
  }
};
