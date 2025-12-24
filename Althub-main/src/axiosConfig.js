import axios from 'axios';

axios.defaults.withCredentials = true;
// 1. Request Interceptor: Attaches Token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("Althub_Token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handles Token Expiry (Optional but recommended)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend says "Unauthorized" (401), it means token is invalid/expired
    if (error.response && error.response.status === 401) {
      console.warn("Session Expired: 401 Unauthorized");
      // Optional: Force logout if token is definitely dead
      // localStorage.clear();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);