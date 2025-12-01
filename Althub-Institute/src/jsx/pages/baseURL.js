export const ALTHUB_API_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5001"
  : "https://althub-student-connect.onrender.com";