import axios from 'axios';
import { ALTHUB_API_URL } from '../pages/baseURL';

const instance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true // Important: sends cookies along with requests
});

const readCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
};

// --- REQUEST INTERCEPTOR ---
instance.interceptors.request.use(
    function (config) {
        const csrfToken = readCookie('csrf_token');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
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
                localStorage.removeItem('userDetails');
                localStorage.removeItem('userRole');
                localStorage.removeItem('AlmaPlus_institute_Id');
                localStorage.removeItem('AlmaPlus_institute_Name');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
