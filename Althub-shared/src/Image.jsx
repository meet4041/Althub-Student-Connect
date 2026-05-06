import React, { useState, useEffect } from 'react';
import { buildImageUrl, getImageOnError } from './images.js';

/**
 * Drop-in replacement for ProtectedImage that renders a plain <img>.
 * Relies on browser-native loading + the server's Cache-Control + ETag
 * (see Althub-server/routes/imagesRoute.js) to handle caching.
 *
 * Auth still works: the browser sends the same HttpOnly auth cookies on
 * <img> requests as on fetch requests, as long as frontend and backend
 * share an origin (vite dev proxy / vercel.json rewrites).
 *
 * Props are compatible with ProtectedImage so call sites can be migrated
 * with a simple rename:
 *   - `src` (preferred) or `imgSrc` (legacy): backend path or full URL
 *   - `fallback` (preferred) or `defaultImage` (legacy): shown on error/empty
 *   - `baseURL`: prepended for relative paths; omit when same-origin
 */
const Image = ({
  src,
  imgSrc,
  alt = '',
  fallback,
  defaultImage,
  baseURL = '',
  className,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) => {
  const rawSrc = src ?? imgSrc;
  const fallbackSrc = fallback ?? defaultImage ?? '/images/profile1.png';
  const resolved = buildImageUrl(rawSrc, { baseURL, fallback: fallbackSrc });
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(buildImageUrl(rawSrc, { baseURL, fallback: fallbackSrc }));
  }, [rawSrc, baseURL, fallbackSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={getImageOnError(fallbackSrc)}
      {...rest}
    />
  );
};

export default Image;
