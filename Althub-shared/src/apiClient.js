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

  // Transitional v1 aliases for live backends that have not deployed /api/v1 yet.
  if (path === '/api/v1/register') return route('/api/register');
  if (path === '/api/v1/userLogin') return route('/api/userLogin');
  if (path === '/api/v1/userLogout') return route('/api/userLogout');
  if (path === '/api/v1/userForgetPassword') return route('/api/userForgetPassword');
  if (path === '/api/v1/userResetPassword') return route(config.url.replace('/api/v1/userResetPassword', '/api/userResetPassword'));
  if (path === '/api/v1/registerInstitute') return route('/api/registerInstitute');
  if (path === '/api/v1/instituteLogin') return route('/api/instituteLogin');
  if (path === '/api/v1/instituteLogout') return route('/api/instituteLogout');
  if (path === '/api/v1/instituteForgetPassword') return route('/api/instituteForgetPassword');
  if (path === '/api/v1/instituteResetPassword') return route(config.url.replace('/api/v1/instituteResetPassword', '/api/instituteResetPassword'));
  if (path === '/api/v1/instituteUpdatePassword') return route('/api/instituteUpdatePassword');
  if (path === '/api/v1/uploadUserImage') return route('/api/uploadUserImage');
  if (path === '/api/v1/uploadCompanyLogo') return route('/api/uploadCompanyLogo');
  if (path === '/api/v1/uploadInstituteImage') return route('/api/uploadInstituteImage');
  if (path === '/api/v1/bulkInviteAlumniCsv') return route('/api/bulkInviteAlumniCsv');
  if (path === '/api/v1/portalAnnouncement') return route('/api/portalAnnouncement');

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
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/profile-image$/);
  if (match && method === 'put') return route('/api/updateProfilePic');
  if (match && method === 'delete') return route(`/api/deleteProfilePic/${match[1]}`);
  match = path.match(/^\/api\/v1\/users\/me\/password$/);
  if (method === 'put' && match) {
    return route('/api/updatePassword', { method: 'post' });
  }
  match = path.match(/^\/api\/v1\/users\/([^/]+)$/);
  if (method === 'get' && match) return route(`/api/searchUserById/${match[1]}`);
  if (method === 'delete' && match) return route(`/api/deleteUser/${match[1]}`);
  if ((method === 'patch' || method === 'put') && match) {
    return route('/api/userProfileEdit', {
      method: 'post',
      data: appendBodyId(config.data, match[1]),
    });
  }
  if (method === 'put' && match) return route(`/api/follow/${match[1]}`);
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/follow$/);
  if (method === 'put' && match) return route(`/api/follow/${match[1]}`);
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/unfollow$/);
  if (method === 'put' && match) return route(`/api/unfollow/${match[1]}`);

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

  // Education
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/education$/);
  if (method === 'get' && match) return route('/api/getEducation', { method: 'post', data: { userid: match[1] } });
  if (method === 'post' && match) return route('/api/addEducation', { data: { ...(config.data || {}), userid: match[1] } });
  match = path.match(/^\/api\/v1\/education\/([^/]+)$/);
  if ((method === 'patch' || method === 'put') && match) {
    return route('/api/editEducation', {
      method: 'post',
      data: appendBodyId(config.data, match[1]),
    });
  }
  if (method === 'delete' && match) return route(`/api/deleteEducation/${match[1]}`);

  // Experience
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/experience$/);
  if (method === 'get' && match) return route('/api/getExperience', { method: 'post', data: { userid: match[1] } });
  if (method === 'post' && match) return route('/api/addExperience', { data: { ...(config.data || {}), userid: match[1] } });
  match = path.match(/^\/api\/v1\/experience\/([^/]+)$/);
  if ((method === 'patch' || method === 'put') && match) {
    return route('/api/editExperience', {
      method: 'post',
      data: { ...(config.data || {}), _id: match[1] },
    });
  }
  if (method === 'delete' && match) return route(`/api/deleteExperience/${match[1]}`);

  // Conversations and messages
  match = path.match(/^\/api\/v1\/users\/([^/]+)\/conversations$/);
  if (method === 'get' && match) return route(`/api/getConversations/${match[1]}`);
  if (method === 'post' && path === '/api/v1/conversations') return route('/api/newConversation');
  if (method === 'post' && path === '/api/v1/conversations/search') return route('/api/searchConversations');
  match = path.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/);
  if (method === 'get' && match) return route(`/api/getMessages/${match[1]}`);
  if (method === 'post' && path === '/api/v1/messages') return route('/api/newMessage');

  // Feedback
  if (method === 'post' && path === '/api/v1/feedback') return route('/api/addFeedback');
  if (method === 'get' && path === '/api/v1/feedback') return route('/api/getFeedback');
  if (method === 'get' && path === '/api/v1/feedback/leaderboard') return route('/api/getLeaderboard');
  match = path.match(/^\/api\/v1\/feedback\/([^/]+)$/);
  if (method === 'delete' && match) return route(`/api/deleteFeedback/${match[1]}`);

  // Institutes and courses
  if (method === 'get' && path === '/api/v1/institutes') return route('/api/getInstitutes');
  match = path.match(/^\/api\/v1\/institutes\/([^/]+)$/);
  if (method === 'get' && match) return route(`/api/getInstituteById/${match[1]}`);
  if ((method === 'patch' || method === 'put') && match) {
    return route('/api/instituteUpdate', {
      method: 'post',
      data: appendBodyId(config.data, match[1]),
    });
  }
  match = path.match(/^\/api\/v1\/institutes\/([^/]+)\/alumni-office$/);
  if (method === 'get' && match) return route(`/api/getAlumniOfficeByInstitute/${match[1]}`);
  match = path.match(/^\/api\/v1\/institutes\/([^/]+)\/placement-cell$/);
  if (method === 'get' && match) return route(`/api/getPlacementCellByInstitute/${match[1]}`);
  if (method === 'post' && path === '/api/v1/courses') return route('/api/addCourse');

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
