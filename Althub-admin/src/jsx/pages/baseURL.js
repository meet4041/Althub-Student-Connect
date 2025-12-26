// NOTE: I changed the local port to 5001 because your server/index.js uses 5001.

export const ALTHUB_API_URL = 
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5001"
    : "https://althub-server.onrender.com"; // <--- REPLACE THIS with your actual backend URL