// admin/src/jsx/baseURL.jsx

// This logic prioritizes the Vercel/Render environment variable
export const WEB_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const ALTHUB_API_URL = WEB_URL;