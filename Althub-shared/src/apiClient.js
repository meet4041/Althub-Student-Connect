import axios from 'axios';
import { readCookie } from './cookies.js';

export const attachCsrfToken = (config) => {
  config.headers = config.headers || {};

  const csrfToken = readCookie('csrf_token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
};

export const createApiClient = ({
  baseURL,
  loginPath = '/login',
  publicPaths = [],
  redirectOnUnauthorized = true,
} = {}) => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
  });

  client.interceptors.request.use(attachCsrfToken, (error) => Promise.reject(error));

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const shouldRedirect =
        redirectOnUnauthorized &&
        error.response?.status === 401 &&
        typeof window !== 'undefined';

      if (shouldRedirect) {
        const currentPath = window.location.pathname;
        if (!publicPaths.includes(currentPath)) {
          window.location.href = loginPath;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const configureGlobalAxios = ({ baseURL } = {}) => {
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use(attachCsrfToken, (error) => Promise.reject(error));
};
