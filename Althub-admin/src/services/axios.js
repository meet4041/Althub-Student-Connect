import axios from 'axios';
import { ALTHUB_API_URL } from '../jsx/pages/baseURL';

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
});

// Attach Token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure this key matches what you set in Login.js ('AlmaPlus_admin_Token')
        const token = localStorage.getItem('AlmaPlus_admin_Token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- NEW HELPER FUNCTION ---
// This fetches an image using the auth token and returns a blob URL
export const fetchSecureImage = async (imagePath) => {
    if (!imagePath) return null;
    
    // If it's a local asset or placeholder, return as is
    if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
         return imagePath;
    }

    try {
        const response = await axiosInstance.get(imagePath, {
            responseType: 'blob' // Important: Request binary data
        });
        // Create a local URL that the browser can display
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Failed to load secure image:", error);
        return 'assets/img/login-bg/profile1.png'; // Fallback
    }
};

export default axiosInstance;