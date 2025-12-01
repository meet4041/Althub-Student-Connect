// If the app is running in "development" mode (npm start), use localhost.
// Otherwise (npm run build), use the Render URL.
export const WEB_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5001"
  : "https://althub-student-connect.onrender.com"; // Replace with your actual Render Backend URL