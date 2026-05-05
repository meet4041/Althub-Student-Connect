export const buildImageUrl = (path, { baseURL, fallback, token = null } = {}) => {
  if (!path || typeof path !== 'string') return fallback;

  const trimmed = path.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalizedBaseUrl = typeof baseURL === 'string' ? baseURL.replace(/\/+$/, '') : '';

  if (cleanPath.startsWith('/api/images/') && token) {
    return `${normalizedBaseUrl}${cleanPath}?token=${encodeURIComponent(token)}`;
  }

  return `${normalizedBaseUrl}${cleanPath}`;
};

export const getImageOnError = (fallback) => (event) => {
  if (event?.target && !event.target.dataset.fallbackApplied) {
    event.target.dataset.fallbackApplied = 'true';
    event.target.onerror = null;
    event.target.src = fallback;
  }
};
