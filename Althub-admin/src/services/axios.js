import axios from 'axios';
import { ALTHUB_API_URL } from '../baseURL';

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL
});

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

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('AlmaPlus_admin_Token');
            localStorage.removeItem('AlmaPlus_admin_Id');
            localStorage.removeItem('AlmaPlus_admin_Email');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;