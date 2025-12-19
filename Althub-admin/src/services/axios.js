import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // REQUIRED: Sends JWT cookies to Render
});

// Setting global defaults as a backup
axios.defaults.withCredentials = true;

/**
 * Response Interceptor
 * Updated to handle your special security requirement where even successful
 * logins return a 401 status code.
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // Standard 200-series successes
        return response;
    },
    (error) => {
        const { response } = error;

        // FIX: Handle the special case where status is 401 but data says "success: true"
        // This allows your login to work even if the console shows an error.
        if (response && response.status === 401 && response.data && response.data.success === true) {
            console.log("Login success detected (ignoring 401 status for security mask)");
            return response; // Resolve as a success to the calling function
        }

        // Actual Security Failures (Unauthorized or Forbidden)
        if (response && (response.status === 401 || response.status === 403)) {
            const errorMsg = response.data.msg;
            
            // If the error is real (not your masked success), clear storage and logout
            console.warn("Session expired or unauthorized. Logging out...");
            
            // Clear all admin data from storage
            localStorage.removeItem('AlmaPlus_admin_Id');
            localStorage.removeItem('AlmaPlus_admin_Email');
            localStorage.removeItem('AlmaPlus_admin_Token'); 
            localStorage.removeItem('AlmaPlus_admin_Name');
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;