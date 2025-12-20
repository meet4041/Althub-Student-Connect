import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // REQUIRED: Sends JWT cookies to Render
});

// Setting global defaults as a backup
axios.defaults.withCredentials = true;

/**
 * REQUEST INTERCEPTOR (Critical for Safari)
 * Safari blocks third-party cookies. We must manually attach the token 
 * from LocalStorage to the Authorization header to ensure the user stays logged in.
 */
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('AlmaPlus_admin_Token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles global errors and your specific 401 logic.
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
            console.warn("Session expired or unauthorized. Logging out...");
            
            // Clear all admin data from storage
            localStorage.removeItem('AlmaPlus_admin_Id');
            localStorage.removeItem('AlmaPlus_admin_Email');
            localStorage.removeItem('AlmaPlus_admin_Token'); 
            localStorage.removeItem('AlmaPlus_admin_Name');
            localStorage.removeItem('AlmaPlus_admin_Pic'); // Added based on your Menu.jsx usage
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

/**
 * Securely fetches an image as a Blob using the authenticated axios instance.
 * @param {string} imageId - The ID of the image to fetch
 * @returns {Promise<string>} - A local URL (blob:...) that can be used in <img src>
 */
export const fetchSecureImage = async (imageId) => {
  try {
    // If the ID is empty or null, return null immediately
    if (!imageId) return null;

    // Check if the input is already a full URL (legacy support)
    if (imageId.startsWith('http')) return imageId;

    const response = await axiosInstance.get(`/api/images/${imageId}`, {
      responseType: 'blob' // Critical: tells axios to handle the response as binary data
    });
    
    // Create a local URL for the blob
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Failed to fetch secure image:", error);
    return null; // Return null on error so the UI can show a placeholder
  }
};

export default axiosInstance;