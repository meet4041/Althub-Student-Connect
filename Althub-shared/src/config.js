export const RENDER_API_URL = 'https://althub-server.onrender.com';
export const LOCAL_API_URL = 'http://localhost:5001';

export const trimTrailingSlash = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\/+$/, '');
};

export const getApiBaseUrl = ({ envApiUrl, mode } = {}) => {
  const baseUrl = envApiUrl || (mode === 'production' ? RENDER_API_URL : LOCAL_API_URL);
  return trimTrailingSlash(baseUrl);
};

export const getViteApiBaseUrl = (metaEnv = {}) => {
  return getApiBaseUrl({
    envApiUrl: metaEnv.VITE_API_URL,
    mode: metaEnv.MODE,
  });
};
