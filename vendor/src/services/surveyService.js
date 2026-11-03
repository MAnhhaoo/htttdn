import { apiClient } from '../api/client';

export const surveyService = {
  getMine: async (params = {}) => {
    return apiClient.get('/surveys/mine', { params });
  },

  getTemplates: async (target = 'shop') => {
    return apiClient.get('/surveys/templates', { params: { target } });
  },

  createSurvey: async (data) => {
    return apiClient.post('/surveys', data);
  },

  getSurveyDetail: async (id) => {
    return apiClient.get(`/surveys/${id}/manage`);
  },

  updateSurvey: async (id, data) => {
    return apiClient.patch(`/surveys/${id}`, data);
  },

  changeStatus: async (id, status) => {
    return apiClient.patch(`/surveys/${id}/status`, { status });
  },

  getResults: async (id, params = {}) => {
    return apiClient.get(`/surveys/${id}/results`, { params });
  },

  deleteSurvey: async (id) => {
    return apiClient.delete(`/surveys/${id}`);
  },

  getInbox: async (params = {}) => {
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
};
