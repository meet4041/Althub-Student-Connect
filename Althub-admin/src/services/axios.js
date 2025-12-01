import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // <--- CRITICAL: This allows the browser to send/receive the 'jwt_token' cookie
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

// We do NOT need a request interceptor to add headers because 
// the browser automatically handles the cookie for us.

// Response Interceptor: Handle Session Expiry / Logout
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // If the backend says "Login First" (400 or 401)
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
            const errorMsg = error.response.data.msg;
            
            if(errorMsg === "Login First" || error.response.status === 401) {
                // Clear user details from local storage
                // Note: We don't clear the token here because it's in a HttpOnly cookie (browser handles it)
                localStorage.removeItem('AlmaPlus_admin_Id');
                localStorage.removeItem('AlmaPlus_admin_Email');
                
                // Redirect to login if we aren't already there
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;