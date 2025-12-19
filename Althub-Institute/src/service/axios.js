import axios from 'axios';

// This instance ensures secure communication with your backend
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001', // Ensure this matches your Server port
    withCredentials: true, // REQUIRED: To send/receive secure HTTP-only cookies
});

// Global error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If server returns 401, the session is invalid
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;