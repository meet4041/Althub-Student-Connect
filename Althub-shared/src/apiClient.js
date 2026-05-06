import axios from 'axios';
import { readCookie } from './cookies.js';

// CSRF token strategy
// -------------------
// The backend uses double-submit cookies: it sets a `csrf_token` cookie and
// expects the same value echoed back in the `X-CSRF-Token` header.
//
// In SAME-ORIGIN mode (Vercel rewrites / vite proxy) the cookie is readable
// via document.cookie, so we can attach the header directly from the cookie.
//
// In CROSS-SITE mode (frontend on a different domain than the backend) the
// browser still sends the cookie automatically (because of SameSite=None;
// Secure + withCredentials), but the cookie is NOT readable via document.cookie
// because it lives on the backend's domain. So the frontend's JS has no way
// to know the value to echo back — unless we explicitly ask the backend.
//
// To handle both cases uniformly, every client maintains an in-memory token
// cache that's hydrated from `GET /api/v1/csrf` on first need. We prefer:
//   1. cached value (fastest, works in both modes)
//   2. cookie value (covers same-origin without an extra round-trip)
//   3. fetch from /csrf (covers cross-site)

const CSRF_FETCH_PATH = '/api/v1/csrf';

const tokenCache = new WeakMap(); // axios instance -> { token, inflight }

const getCachedToken = (client) => tokenCache.get(client)?.token || null;

const fetchCsrfToken = async (client) => {
  const cached = tokenCache.get(client) || {};
  if (cached.inflight) return cached.inflight;

  const inflight = (async () => {
    try {
      // Bare axios so we don't recurse through this client's interceptors.
      const response = await axios.get(`${client.defaults.baseURL || ''}${CSRF_FETCH_PATH}`, {
        withCredentials: true,
      });
      const token = response.data?.csrfToken || readCookie('csrf_token') || null;
      tokenCache.set(client, { token });
      return token;
    } catch (error) {
      tokenCache.set(client, { token: null });
      return null;
    }
  })();

  tokenCache.set(client, { ...cached, inflight });
  return inflight;
};

export const attachCsrfToken = (client) => async (config) => {
  config.headers = config.headers || {};

  // Skip the CSRF endpoint itself to avoid infinite loops.
  if (config.url?.includes(CSRF_FETCH_PATH)) return config;

  let token = getCachedToken(client) || readCookie('csrf_token');

  // For state-changing requests, ensure we have a token (fetch if needed).
  const method = String(config.method || 'get').toLowerCase();
  const isWrite = !['get', 'head', 'options'].includes(method);
  if (!token && isWrite) {
    token = await fetchCsrfToken(client);
  }

  if (token) {
    config.headers['X-CSRF-Token'] = token;
    // Keep cache fresh from cookie too (in case backend rotated it).
    if (!getCachedToken(client)) tokenCache.set(client, { token });
  }

  return config;
};

const isCsrfFailure = (error) => {
  if (error.response?.status !== 403) return false;
  const data = error.response.data;
  if (!data) return false;
  // Match the structured error from the new backend, plus the legacy string.
  return data.msg === 'CSRF check failed' || data.msg === 'CSRF token invalid or missing';
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

  client.interceptors.request.use(attachCsrfToken(client), (error) => Promise.reject(error));

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const config = error.config || {};

      // One-shot retry on CSRF failure: refresh token from server and replay.
      // Common cause: cookie rotated, or first request before any GET set the
      // cookie. Without this retry the user sees a generic 403 and is stuck.
      if (isCsrfFailure(error) && !config.__csrfRetried) {
        config.__csrfRetried = true;
        // Invalidate cached token; force a fresh fetch.
        tokenCache.delete(client);
        const fresh = await fetchCsrfToken(client);
        if (fresh) {
          config.headers = { ...(config.headers || {}), 'X-CSRF-Token': fresh };
          return client.request(config);
        }
      }

      // Transitional: if /api/v1/X 404s (or 403s from a backend whose CSRF
      // allowlist doesn't recognize v1-prefixed paths), retry on /api/X. This
      // keeps things working when the backend deploy is behind the frontend.
      // Once backend has /api/v1, v1 paths will succeed first try and this
      // branch becomes inert.
      const canFallbackToLegacy =
        (status === 404 || status === 403) &&
        !config.__legacyPathFallbackTried &&
        typeof config.url === 'string' &&
        config.url.includes('/api/v1/');
      if (canFallbackToLegacy) {
        config.__legacyPathFallbackTried = true;
        config.url = config.url.replace('/api/v1/', '/api/');
        return client.request(config);
      }

      const shouldRedirect =
        redirectOnUnauthorized &&
        status === 401 &&
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
  axios.interceptors.request.use(attachCsrfToken(axios), (error) => Promise.reject(error));
};
