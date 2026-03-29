<<<<<<< HEAD
export const WEB_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
=======
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const localApiFallback = "http://localhost:5001";

// Production-safe resolution:
// 1. Prefer explicit VITE_API_URL
// 2. In local Vite dev, use the local backend
// 3. Otherwise fall back to same-origin deployments/reverse proxies
export const WEB_URL = configuredApiUrl || (import.meta.env.DEV ? localApiFallback : browserOrigin);
export const ALTHUB_API_URL = WEB_URL;
>>>>>>> c94aaa1 (althub main v2)
