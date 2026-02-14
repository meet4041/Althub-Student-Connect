/**
 * Image URL utilities for Althub Admin.
 * Handles image URLs for protected image routes and works with Vercel deployment.
 */
import { ALTHUB_API_URL } from '../pages/baseURL';

/** Default fallback images by context */
export const FALLBACK_IMAGES = {
    profile: 'assets/img/profile1.png',
    event: 'assets/img/Events-amico.png',
    post: 'assets/img/Events-amico.png',
};

/**
 * Builds full image URL for protected /api/images routes.
 * @param {string} path - Path from API (e.g. /api/images/xxx or api/images/xxx)
 * @param {string} fallback - Fallback path when image fails (relative to public)
 */
export function getImageUrl(path, fallback = FALLBACK_IMAGES.profile) {
    if (!path || typeof path !== 'string') return fallback;
    const trimmed = path.trim();
    if (!trimmed) return fallback;
    // Already absolute URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    // Normalize: ensure leading slash for API paths
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const baseUrl = ALTHUB_API_URL.replace(/\/$/, '');
    const fullUrl = `${baseUrl}${cleanPath}`;
    return fullUrl;
}

/**
 * Standard onError handler for img tags - swaps to fallback
 */
export function getImageOnError(fallback = FALLBACK_IMAGES.profile) {
    return (e) => {
        if (e?.target && !e.target.dataset.fallbackApplied) {
            e.target.dataset.fallbackApplied = 'true';
            e.target.onerror = null;
            e.target.src = fallback;
        }
    };
}
