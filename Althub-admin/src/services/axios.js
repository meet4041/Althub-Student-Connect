import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // REQUIRED: Sends JWT cookies to Render
});

// Setting global defaults as a backup
axios.defaults.withCredentials = true;

// Response Interceptor: Automatically logs out if token expires or is invalid
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If server says Unauthorized (401) or Forbidden (403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const errorMsg = error.response.data.msg;
            
            // If the error message indicates a session failure
            if (errorMsg === "Login First" || errorMsg === "Invalid token" || error.response.status === 401) {
                console.warn("Session expired or invalid. Logging out...");
                
                // Clear all admin data from storage
                localStorage.removeItem('AlmaPlus_admin_Id');
                localStorage.removeItem('AlmaPlus_admin_Email');
                localStorage.removeItem('AlmaPlus_admin_Token'); 
                
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