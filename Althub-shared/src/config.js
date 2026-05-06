export const RENDER_API_URL = 'https://althub-server.onrender.com';
export const LOCAL_API_URL = 'http://localhost:5001';

export const trimTrailingSlash = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\/+$/, '');
};

export const getApiBaseUrl = ({ envApiUrl, mode, sameOrigin } = {}) => {
  // Same-origin mode: frontend reaches backend via reverse proxy at the same host
  // (vite dev proxy in dev; vercel.json/nginx rewrites in prod). Returns empty string
  // so axios produces relative URLs like `/api/...`.
  if (sameOrigin) return '';
  const baseUrl = envApiUrl || (mode === 'production' ? RENDER_API_URL : LOCAL_API_URL);
  return trimTrailingSlash(baseUrl);
};

const isSameOriginFlag = (value) =>
  value === true || value === 'true' || value === '1';

export const getViteApiBaseUrl = (metaEnv = {}) => {
  return getApiBaseUrl({
    envApiUrl: metaEnv.VITE_API_URL,
    mode: metaEnv.MODE,
    sameOrigin: isSameOriginFlag(metaEnv.VITE_SAME_ORIGIN),
  });
};
