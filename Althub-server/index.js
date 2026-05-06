import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import compression from "compression";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { corsOptions, cspConnectSrc } from "./config/origins.js";
import { createApiRouter } from "./routes/apiRoutes.js";
import { buildInfo } from "./utils/buildInfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectToMongo } from "./db/conn.js";
const app = express();
const port = process.env.PORT || 5001;

// --- SECURITY & SERVER CONFIGURATION ---
app.set("trust proxy", 1); 
app.disable("x-powered-by");

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: cspConnectSrc,
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true }));
}

app.use(compression()); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// --- RATE LIMITING ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, msg: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, msg: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const imageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3000,
  message: { success: false, msg: 'Image request limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- CSRF (Double Submit Cookie) ---
//
// Strategy:
//  - Every request gets a `csrf_token` cookie (readable, SameSite=None in prod
//    so it survives cross-site requests; HttpOnly auth cookies are separate).
//  - State-changing methods must echo it back in the X-CSRF-Token header.
//  - Pre-auth endpoints (login/register/password reset) are allowlisted because
//    a fresh visitor may not have a cookie yet.
//
// Path matching: requests can arrive as `/v1/<endpoint>` (current) or `/<endpoint>`
// (legacy mount, removed but third-party clients may still hit it). We list
// canonical endpoint names once and expand to all known prefixes so the check
// is robust to mount-path changes and avoids surprises like the one fixed in
// commit history (frontend on /api/v1, backend allowlist only had /<endpoint>,
// CSRF rejected logins).

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
};

const CSRF_EXEMPT_ENDPOINTS = [
  "adminLogin",
  "instituteLogin",
  "userLogin",
  "registerInstitute",
  "register",
  "uploadUserImage",
  "instituteForgetPassword",
  "instituteResetPassword",
  "forgetpassword",
  "resetpassword",
  "userForgetPassword",
  "userResetPassword",
  "refreshToken",
];

// Build allowlist with every prefix the CSRF middleware might see.
// `app.use("/api", csrfProtect)` strips `/api`, so req.path will be either
// `/v1/<endpoint>` or `/<endpoint>` (legacy). Belt-and-suspenders: include both.
const CSRF_PREFIXES = ['', '/v1'];
const csrfAllowlist = new Set(
  CSRF_EXEMPT_ENDPOINTS.flatMap((endpoint) =>
    CSRF_PREFIXES.map((prefix) => `${prefix}/${endpoint}`)
  )
);

const ensureCsrfCookie = (req, res, next) => {
  if (!req.cookies?.csrf_token) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, csrfCookieOptions);
    // Expose immediately so a request that both sets the cookie AND checks it
    // (e.g. login flow) can succeed on the first try.
    req.cookies = { ...(req.cookies || {}), csrf_token: csrfToken };
  }
  next();
};

const csrfProtect = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return next();
  if (csrfAllowlist.has(req.path)) return next();

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    // Diagnostic: which side is missing? Helps when frontend forgets to send
    // the header or when cross-site cookie is being blocked by the browser.
    const reason = !cookieToken
      ? "csrf_token cookie missing (browser may be blocking 3rd-party cookies; check SameSite/Secure and same-origin setup)"
      : !headerToken
        ? "X-CSRF-Token header missing (apiClient should attach it from the cookie automatically)"
        : "CSRF token mismatch (cookie was rotated; client should re-read the cookie before retrying)";
    return res.status(403).json({ success: false, msg: "CSRF check failed", reason, path: req.path });
  }
  next();
};

app.use("/api", ensureCsrfCookie, csrfProtect);

// CSRF token-fetch endpoint.
//
// In cross-site setups (e.g. frontend on *.vercel.app, backend on
// *.onrender.com), the browser stores the csrf_token cookie on the backend's
// domain — so the frontend's `document.cookie` cannot read it. This endpoint
// returns the token in the response BODY so the frontend can hold it in
// memory and echo it back via the X-CSRF-Token header.
//
// Mounted under /api so `ensureCsrfCookie` (above) has already set the cookie
// on this same response. GET method is exempt from `csrfProtect` so this
// endpoint works on the very first visit.
app.get("/api/csrf", (req, res) => {
  res.json({ csrfToken: req.cookies?.csrf_token || null });
});
app.get("/api/v1/csrf", (req, res) => {
  res.json({ csrfToken: req.cookies?.csrf_token || null });
});

const apiVersionHeader = (version) => (req, res, next) => {
  res.setHeader("X-Althub-API-Version", version);
  next();
};

const legacyApiHeader = (req, res, next) => {
  res.setHeader("X-Althub-API-Version", "legacy");
  res.setHeader("X-Althub-API-Deprecated", "true");
  res.setHeader("X-Althub-API-Successor", "/api/v1");
  next();
};

// --- MOUNT ROUTES ---
// Both /api (legacy) and /api/v1 are mounted. Keeping the legacy mount means
// a rolling deploy can never leave the system in a state where the frontend
// uses paths the backend doesn't serve. Once all clients have moved to /v1
// for an extended period, the legacy mount can be removed.
const apiRouterOptions = { apiLimiter, imageLimiter, loginLimiter };
app.use("/api/v1", apiVersionHeader("v1"), createApiRouter({ ...apiRouterOptions, includeResourceAliases: true }));
app.use("/api", legacyApiHeader, createApiRouter(apiRouterOptions));

// Health Check + deploy identification.
// `curl /` shows the running commit so you can verify what's actually live
// without guessing from behavior. Also exposed as JSON at /version.
app.get("/", (req, res) => {
  res
    .status(200)
    .type("text/plain")
    .send(
      `Althub Server is running!\n` +
      `commit:  ${buildInfo.shortCommit || "unknown"} (${buildInfo.commit || "unknown"})\n` +
      `branch:  ${buildInfo.branch || "unknown"}\n` +
      `started: ${buildInfo.startedAt}\n` +
      `node:    ${buildInfo.nodeVersion}\n` +
      `env:     ${buildInfo.env}\n`
    );
});

app.get("/version", (req, res) => res.status(200).json(buildInfo));

app.use(express.static(path.join(__dirname, "public")));

// Error Handler
app.use(globalErrorHandler);

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, { 
  cors: corsOptions, 
  transports: ["websocket", "polling"]
});

let users = [];

const addUser = (userId, socketId) => {
  if (!userId) return;
  users = users.filter((user) => user.userId !== userId);
  users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    if (userId) {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    }
  });
  socket.on("sendMessage", ({ senderId, receiverId, text, time }) => {
    const user = getUser(receiverId);
    if (user && user.socketId) {
      io.to(user.socketId).emit("getMessage", { senderId, text, time });
    }
  });
  socket.on("sendNotification", ({ receiverid, title, msg }) => {
    const user = getUser(receiverid);
    if (user && user.socketId) {
      io.to(user.socketId).emit("getNotification", { title, msg });
    }
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// --- START SERVER ---
connectToMongo()
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
      console.log(
        `Build: commit=${buildInfo.shortCommit || "unknown"} ` +
        `branch=${buildInfo.branch || "unknown"} ` +
        `env=${buildInfo.env}`
      );
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
  });

export default app;
