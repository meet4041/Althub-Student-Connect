import { configureGlobalAxios as configureSharedGlobalAxios, createApiClient } from '@althub/shared/api';
import { WEB_URL } from '../config/api';

export const apiClient = createApiClient({
  baseURL: WEB_URL,
  redirectOnUnauthorized: false,
});

export const configureGlobalAxios = () => {
  configureSharedGlobalAxios({ baseURL: WEB_URL });
};

export default apiClient;
