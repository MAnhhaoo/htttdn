import { apiClient } from '../api/client';

export const authService = {
  login: async (credentials) => {
    return apiClient.post('/auth/sign-in', credentials);
  },
  
  register: async (data) => {
    return apiClient.post('/auth/sign-up/vendor', data);
  },

  getCurrentUser: async () => {
    return apiClient.get('/users/profile');
  },

  logout: async () => {
    return apiClient.post('/auth/sign-out');
  }
};
