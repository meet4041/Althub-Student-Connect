import { createApiClient } from '@althub/shared/api';
import { ALTHUB_API_URL } from '../config/baseURL';

const apiClient = createApiClient({
    baseURL: ALTHUB_API_URL,
    publicPaths: ['/', '/login', '/forgot-password', '/new-password'],
    loginPath: '/login',
});

export const fetchSecureImage = async (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http') && !imagePath.includes('api/images')) {
        return imagePath;
    }

    try {
        const response = await apiClient.get(imagePath, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Failed to load secure image:", error);
        return 'assets/img/login-bg/profile1.png';
    }
};

export default apiClient;
