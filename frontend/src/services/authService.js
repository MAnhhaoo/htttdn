import { apiClient } from './apiClient';

export const authService = {
  login: async (email, password) => {
    return await apiClient.post('/auth/sign-in', { email, password });
  },
  
  register: async (data) => {
    return await apiClient.post('/auth/sign-up', data);
  },

  logout: async () => {
    return await apiClient.post('/auth/sign-out');
  },

  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  updateProfile: async (data) => {
    return await apiClient.patch('/users/profile', data);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data?.url || res?.url;
  }
};
