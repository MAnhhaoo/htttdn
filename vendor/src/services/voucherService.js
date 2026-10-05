import { apiClient } from '../api/client';

export const voucherService = {
  getVendorVouchers: async () => {
    return apiClient.get('/vouchers/mine');
  },
  
  getVoucherById: async (id) => {
    return apiClient.get(`/vouchers/${id}`);
  },
  
  createVoucher: async (data) => {
    return apiClient.post('/vouchers', data);
  },
  
  updateVoucher: async (id, data) => {
    return apiClient.patch(`/vouchers/${id}`, data);
  },
  
  updateVoucherStatus: async (id, status) => {
    return apiClient.patch(`/vouchers/${id}/status`, { status });
  },
  
  deleteVoucher: async (id) => {
    return apiClient.delete(`/vouchers/${id}`);
  }
};
