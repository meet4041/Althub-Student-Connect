import { getViteApiBaseUrl } from '@althub/shared/config';

export const ALTHUB_API_URL = getViteApiBaseUrl(import.meta.env);

export const WEB_URL = ALTHUB_API_URL;
