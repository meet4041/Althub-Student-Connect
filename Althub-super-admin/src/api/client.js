import { createApiClient } from '@althub/shared/api';
import { ALTHUB_API_URL } from '../config/baseURL';

const apiClient = createApiClient({
    baseURL: ALTHUB_API_URL,
    publicPaths: ['/', '/login', '/forgot-password', '/new-password'],
    loginPath: '/login',
});

export default apiClient;
