import { getViteApiBaseUrl } from '@althub/shared/config';

export const WEB_URL = getViteApiBaseUrl(import.meta.env);

export const ALTHUB_API_URL = WEB_URL;
