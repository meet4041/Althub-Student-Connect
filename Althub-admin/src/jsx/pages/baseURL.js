// export const ALTHUB_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// This logic automatically switches the backend URL based on where the app is running.
// If it's localhost, it uses your local backend port.
// If it's on a live server, it uses an empty string (""), which tells the browser
// to fetch images and make API calls relative to the current domain.

export const ALTHUB_API_URL = 
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5000"  // Local development backend URL
    : "";                      // Production: use relative path (same domain as frontend)