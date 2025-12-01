import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // CRITICAL: This ensures cookies (jwt_token) are sent to your backend
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

// Request Interceptor: (Optional) You don't need to manually attach the token 
// because 'withCredentials: true' handles it automatically via cookies.

// Response Interceptor: Handles 401 errors (Session Expired/Unauthorized)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // If the backend returns 401 (Unauthorized), log the user out
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            
            // Clear any user details stored in localStorage
            localStorage.removeItem('AlmaPlus_admin_Id');
            localStorage.removeItem('AlmaPlus_admin_Email');
            
            // Redirect to the login page
            // Note: In React, it's often better to use useNavigate, but window.location works for a hard reset
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;