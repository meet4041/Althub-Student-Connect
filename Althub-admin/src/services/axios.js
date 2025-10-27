import axios from 'axios';
import { ALTHUB_API_URL } from '../baseURL';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('AlmaPlus_admin_Token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        Promise.reject(error);
    }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Clear invalid auth data
            localStorage.removeItem('AlmaPlus_admin_Token');
            localStorage.removeItem('AlmaPlus_admin_Id');
            localStorage.removeItem('AlmaPlus_admin_Email');
            
            // Redirect to login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;