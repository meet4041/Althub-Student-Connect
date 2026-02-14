import axios from 'axios';
import { ALTHUB_API_URL } from '../pages/baseURL';

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
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/register', '/forgot-password', '/new-password', '/'];
            if (!publicPaths.includes(currentPath)) {
                localStorage.removeItem('token');
                localStorage.removeItem('userDetails');
                localStorage.removeItem('userRole');
                localStorage.removeItem('AlmaPlus_institute_Id');
                localStorage.removeItem('AlmaPlus_institute_Name');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
