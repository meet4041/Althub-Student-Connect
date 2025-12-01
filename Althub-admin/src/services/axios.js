import axios from "axios";
import { ALTHUB_API_URL } from "../jsx/pages/baseURL";

const axiosInstance = axios.create({
    baseURL: ALTHUB_API_URL,
    withCredentials: true, // --- FIX: CRITICAL FOR DEPLOYMENT ---
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
            const errorMsg = error.response.data.msg;
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