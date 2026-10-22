import { apiClient } from './apiClient';

export const voucherService = {
  catalog: async (productIds) => {
    const result = await apiClient.get('/vouchers/catalog', { params: { productIds: productIds.join(',') } });
    return result.data ?? result;
  },
  previewCheckout: async (data) => {
    const result = await apiClient.post('/orders/preview', data);
    return result.data ?? result;
  },
};
