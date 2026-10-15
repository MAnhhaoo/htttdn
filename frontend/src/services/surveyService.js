import { apiClient } from './apiClient';

export const surveyService = {
  getSurveyInbox: async (params = {}) => {
    return apiClient.get('/surveys/inbox', { params });
  },

  getInboxDetail: async (responseId) => {
    return apiClient.get(`/surveys/inbox/${responseId}`);
  },

  openResponse: async (responseId) => {
    return apiClient.patch(`/surveys/inbox/${responseId}/open`);
  },

  submitResponse: async (responseId, data) => {
    return apiClient.post(`/surveys/inbox/${responseId}/responses`, data);
  },

  skipResponse: async (responseId) => {
    return apiClient.patch(`/surveys/inbox/${responseId}/skip`);
  },

  getPendingForOrder: async (orderId) => {
    return apiClient.get(`/surveys/orders/${orderId}/pending`);
  },
};
