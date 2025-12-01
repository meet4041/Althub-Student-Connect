// Looks for REACT_APP_API_URL env var, defaults to localhost if not found
export const WEB_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";