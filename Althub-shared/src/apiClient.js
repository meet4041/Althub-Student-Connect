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

const appendBodyId = (data, id) => {
  if (!id) return data;

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    if (!data.has('id')) data.append('id', id);
    return data;
  }

  if (data && typeof data === 'object') {
    return { ...data, id };
  }

  return { id };
};

const getRequestPath = (url = '') => {
  if (!url) return '';

  try {
    return new URL(url, 'https://althub.local').pathname;
  } catch (error) {
    return String(url).split('?')[0];
  }
};

const createLegacyFallbackConfig = (config = {}) => {
  const method = String(config.method || 'get').toLowerCase();
  const path = getRequestPath(config.url);

  const route = (legacyUrl, next = {}) => ({
    ...config,
    ...next,
    url: legacyUrl,
    __althubLegacyFallbackRetried: true,
  });

  let match;

  // Posts
  if (method === 'get' && path === '/api/v1/posts') return route('/api/getPost');
  if (method === 'post' && path === '/api/v1/posts') return route('/api/addPost');
  if (method === 'get' && path === '/api/v1/posts/friends') return route('/api/getFriendsPost/all');
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/posts$/);
  if (method === 'get' && match) return route(`/api/getPostById/${match[1]}`);
  match = path.match(/^\/api\/v1\/posts\/([^/]+)$/);
  if (match && method === 'delete') return route(`/api/deletePost/${match[1]}`);
  if (match && (method === 'patch' || method === 'put')) {
    return route('/api/editPost', {
      method: 'post',
      data: appendBodyId(config.data, match[1]),
    });
  }
  match = path.match(/^\/api\/v1\/posts\/([^/]+)\/like$/);
  if (match && method === 'put') return route(`/api/like/${match[1]}`);

  // Events
  if (method === 'get' && path === '/api/v1/events') return route('/api/getEvents');
  if (method === 'post' && path === '/api/v1/events') return route('/api/addEvent');
  if (method === 'get' && path === '/api/v1/events/upcoming') return route('/api/getUpcommingEvents');
  match = path.match(/^\/api\/v1\/institutes\/([^/]+)\/events$/);
  if (method === 'get' && match) return route(`/api/getEventsByInstitute/${match[1]}`);
  match = path.match(/^\/api\/v1\/events\/([^/]+)$/);
  if (match && method === 'delete') return route(`/api/deleteEvent/${match[1]}`);
  if (match && (method === 'patch' || method === 'put')) {
    return route('/api/editEvent', {
      method: 'post',
      data: appendBodyId(config.data, match[1]),
    });
  }
  match = path.match(/^\/api\/v1\/events\/([^/]+)\/participation$/);
  if (match && method === 'put') return route(`/api/participateInEvent/${match[1]}`);

  // Users
  if (method === 'get' && path === '/api/v1/users') return route('/api/getUsers');
  if (method === 'post' && path === '/api/v1/users/search') return route('/api/searchUser');
  if (method === 'post' && path === '/api/v1/users/random') return route('/api/getRandomUsers');
  match = path.match(/^\/api\/v1\/institutes\/([^/]+)\/users$/);
  if (method === 'get' && match) return route(`/api/getUsersOfInstitute/${match[1]}`);
  match = path.match(/^\/api\/v1\/users\/([^/]+)$/);
  if (method === 'get' && match) return route(`/api/searchUserById/${match[1]}`);
  if (method === 'put' && match) return route(`/api/follow/${match[1]}`);

  // Notifications
  if (method === 'post' && path === '/api/v1/notifications') return route('/api/addNotification');
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/notifications$/);
  if (method === 'get' && match) {
    return route('/api/getnotifications', {
      method: 'post',
      data: { ...(config.data || {}), userid: match[1] },
    });
  }
  match = path.match(/^\/api\/v1\/notifications\/([^/]+)$/);
  if (method === 'delete' && match) {
    return route('/api/deleteNotification', {
      method: 'post',
      data: { ...(config.data || {}), notificationId: match[1] },
    });
  }

  return null;
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
      const status = error.response?.status;
      const fallbackConfig =
        status === 404 &&
        !error.config?.__althubLegacyFallbackRetried &&
        createLegacyFallbackConfig(error.config);

      if (fallbackConfig) {
        return client.request(fallbackConfig);
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
  axios.interceptors.request.use(attachCsrfToken, (error) => Promise.reject(error));
};
