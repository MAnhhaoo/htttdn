import { createApiClient } from '@shared/api/createApiClient';

const axiosClient = createApiClient({
  role: 'admin',
  unwrapData: false,
  skipRefreshUrls: ['/auth/sign-in', '/auth/sign-out', '/auth/refresh-token', '/admins/profile'],
});

export default axiosClient;
