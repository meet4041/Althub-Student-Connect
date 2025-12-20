// Althub-Institute/src/jsx/pages/baseURL.js
const RENDER_URL = "https://althub-server.onrender.com"; 

export const ALTHUB_API_URL = 
  process.env.NODE_ENV === "production" 
    ? RENDER_URL 
    : "http://localhost:5001";