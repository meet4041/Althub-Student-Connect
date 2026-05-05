import { getViteApiBaseUrl } from '@althub/shared/config';
import { buildImageUrl } from '@althub/shared/images';

export const ALTHUB_API_URL = getViteApiBaseUrl(import.meta.env);

export const WEB_URL = ALTHUB_API_URL;

export const getProtectedImageUrl = (path) => {
  return buildImageUrl(path, {
    baseURL: ALTHUB_API_URL,
    fallback: 'assets/img/login-bg/profile1.png',
  });
};
