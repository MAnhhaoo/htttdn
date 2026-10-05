import { apiClient } from '../api/client';

export const userService = {
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },
  
  updateProfile: async (data) => {
    return apiClient.patch('/users/profile', data);
  }
};
