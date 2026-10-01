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
  }
};
