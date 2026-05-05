/**
 * Image URL utilities for Althub Admin.
 * Handles image URLs for protected image routes and works with Vercel deployment.
 */
import { ALTHUB_API_URL } from '../config/baseURL';
import { buildImageUrl, getImageOnError as createImageOnError } from '@althub/shared/images';

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
    return buildImageUrl(path, {
        baseURL: ALTHUB_API_URL,
        fallback,
    });
}

/**
 * Standard onError handler for img tags - swaps to fallback
 */
export function getImageOnError(fallback = FALLBACK_IMAGES.profile) {
    return createImageOnError(fallback);
}
