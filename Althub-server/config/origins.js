const parseOriginList = (value = "") => {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const localOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://localhost:5001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5001",
];

export const productionOrigins = [
  "https://althub-admin.vercel.app",
  "https://althub-connect.vercel.app",
  "https://althub-super-admin.vercel.app",
  "https://althub-server.onrender.com",
];

export const configuredOrigins = parseOriginList(process.env.ALTHUB_ALLOWED_ORIGINS);

export const allowedOrigins = Array.from(new Set([
  ...localOrigins,
  ...productionOrigins,
  ...configuredOrigins,
]));

export const allowVercelPreviewOrigins = process.env.ALLOW_VERCEL_PREVIEW_ORIGINS !== "false";
export const cspConnectSrc = ["'self'", ...allowedOrigins];

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    return allowedOrigins.includes(origin) || (allowVercelPreviewOrigins && hostname.endsWith(".vercel.app"));
  } catch (error) {
    console.log("Invalid CORS Origin:", origin);
    return false;
  }
};

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log("CORS Blocked Origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Requested-With", "Accept", "X-CSRF-Token"],
};
