import axios from 'axios';
import { ALTHUB_API_URL } from '../config/baseURL';

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
        const csrfToken = match ? decodeURIComponent(match[2]) : null;
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// NEW FUNCTION: Fetch image with auth token and return a Blob URL
export const fetchSecureImage = async (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL (like a placeholder), return it as is
    if (imagePath.startsWith('http') && !imagePath.includes('api/images')) {
        return imagePath;
    }

    try {
        const response = await axiosInstance.get(imagePath, {
            responseType: 'blob' // Important: Expect binary data
        });
        // Create a local URL for the binary data
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Failed to load secure image:", error);
        return 'assets/img/login-bg/profile1.png'; // Fallback image
    }
};

export default axiosInstance;
