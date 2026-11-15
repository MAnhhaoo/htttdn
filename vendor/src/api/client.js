import { createApiClient } from '@shared/api/createApiClient';

export const apiClient = createApiClient({
  role: 'vendor',
  unwrapData: true,
});

export default apiClient;
