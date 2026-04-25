// Helper to detect if we are running locally
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const ALTHUB_API_URL = isLocal
  ? 'http://localhost:5001'
  : 'https://althub-server.onrender.com';

export const WEB_URL = ALTHUB_API_URL;

export const getProtectedImageUrl = (path) => {
  if (!path || typeof path !== 'string') return 'assets/img/login-bg/profile1.png';
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const token = localStorage.getItem('token');

  if (normalizedPath.startsWith('/api/images/') && token) {
    return `${ALTHUB_API_URL}${normalizedPath}?token=${encodeURIComponent(token)}`;
  }

  return `${ALTHUB_API_URL}${normalizedPath}`;
};
