// PUT YOUR EXACT RENDER BACKEND URL HERE (No trailing slash)
const RENDER_URL = "https://althub-server.onrender.com"; 

export const ALTHUB_API_URL = 
  import.meta.env.MODE === "production" 
    ? RENDER_URL 
    : "http://localhost:5001";