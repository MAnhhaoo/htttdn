import { apiClient } from './apiClient';

export const notificationService = {
  getNotifications: async (params = {}) => {
    return apiClient.get('/notifications', { params });
  },

  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },
};
