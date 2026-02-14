// Backend API URL - works for local dev and Vercel deployment
const RENDER_URL = "https://althub-server.onrender.com";
const LOCALHOST_URL = "http://localhost:5001";

export const ALTHUB_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production" ? RENDER_URL : LOCALHOST_URL);