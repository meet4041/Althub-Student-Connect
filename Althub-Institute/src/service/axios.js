import axios from 'axios';
import { ALTHUB_API_URL } from '../jsx/pages/baseURL';

const instance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true // Important: sends cookies along with requests
});

// --- REQUEST INTERCEPTOR ---
instance.interceptors.request.use(
    function (config) {
        // We look for 'token' because that is what your Login.jsx saves
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check for 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.warn("Session Expired or Invalid Token.");
            
            // [CRITICAL FIX] Prevent infinite loops
            // Only redirect if we are NOT already on the login or register page
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;