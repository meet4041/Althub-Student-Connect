const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const localApiFallback = "http://localhost:5001";

export const ALTHUB_API_URL =
  configuredApiUrl || (import.meta.env.DEV ? localApiFallback : browserOrigin);
export const WEB_URL = ALTHUB_API_URL;
