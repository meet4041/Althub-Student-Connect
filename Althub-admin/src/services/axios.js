import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // <--- THIS IS CRITICAL. Without this, no cookies are sent.
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

// Response Interceptor: Handle Session Expiry (401)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // If the backend returns 401 (Unauthorized) or specifically "Login First"
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
            const errorMsg = error.response.data.msg;
            
            if(errorMsg === "Login First" || error.response.status === 401) {
                // Clear any local storage data
                localStorage.removeItem('AlmaPlus_admin_Id');
                localStorage.removeItem('AlmaPlus_admin_Email');
                
                // Redirect to login page if not already there
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;