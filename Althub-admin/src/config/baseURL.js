// Helper to detect if we are running locally
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const ALTHUB_API_URL = isLocal
  ? 'http://localhost:5001'
  : 'https://althub-server.onrender.com';

export const WEB_URL = ALTHUB_API_URL;
