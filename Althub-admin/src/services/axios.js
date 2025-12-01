import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // <--- THIS IS REQUIRED. It sends the cookie to the backend.
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

// Response Interceptor: Handle Session Expiry (401)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
            const errorMsg = error.response.data.msg;
            // Check if backend specifically said "Login First"
            if(errorMsg === "Login First" || error.response.status === 401) {
                localStorage.removeItem('AlmaPlus_admin_Id');
                localStorage.removeItem('AlmaPlus_admin_Email');
                
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;