import axios from 'axios';
import { ALTHUB_API_URL } from '../jsx/pages/baseURL';

const instance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true // Important for cookies
});

// Add a request interceptor to attach the token
instance.interceptors.request.use(
    function (config) {
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

// Add a response interceptor to handle session expiry
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // If token is invalid/expired, clear storage and redirect
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;