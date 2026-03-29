import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import mongoSanitize from "express-mongo-sanitize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectToMongo } from "./db/conn.js";
import user_route from "./routes/userRoute.js";
import event_route from "./routes/eventRoute.js";
import institute_route from "./routes/instituteRoute.js";
import course_route from "./routes/courseRoute.js";
import feedback_route from "./routes/feedbackRoute.js";
import post_route from "./routes/postRoute.js";
import admin_route from "./routes/adminRoute.js";
import conversation_route from "./routes/conversationRoute.js";
import message_route from "./routes/messageRoute.js";
import education_route from "./routes/educationRoute.js";
import experience_route from "./routes/experienceRoute.js";
import company_route from "./routes/companyRoute.js";
import notification_route from "./routes/notificationRoute.js";
import financialaid_route from "./routes/financialaidRoute.js";
import images_route from "./routes/imagesRoute.js";

const app = express();
const port = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === "production";

const parseCsvEnv = (value) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const configuredOrigins = parseCsvEnv(process.env.ALLOWED_ORIGINS);
const clientOriginFallbacks = parseCsvEnv(process.env.CLIENT_ORIGIN);
const allowedOriginsFromEnv = Array.from(new Set([
  ...configuredOrigins,
  ...clientOriginFallbacks
]));
const additionalConnectSrc = parseCsvEnv(process.env.CSP_CONNECT_SRC);
const defaultDevOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];
const allowedOrigins = isProduction
  ? allowedOriginsFromEnv
  : Array.from(new Set([...allowedOriginsFromEnv, ...defaultDevOrigins]));
const connectSrcOrigins = Array.from(new Set([
  "'self'",
  ...allowedOrigins,
  ...allowedOrigins
    .filter((origin) => origin.startsWith("https://"))
    .map((origin) => origin.replace(/^https:\/\//, "wss://")),
  ...allowedOrigins
    .filter((origin) => origin.startsWith("http://"))
    .map((origin) => origin.replace(/^http:\/\//, "ws://")),
  ...additionalConnectSrc
]));

// --- SECURITY & SERVER CONFIGURATION ---
// Required for Render/Vercel to handle secure cookies correctly behind proxies
app.set("trust proxy", 1); 

<<<<<<< HEAD
// 1. HELMET: Allow Cross-Origin Images
// This specific policy allows modern browsers (Chrome/Safari) to render 
// images from this server even if the frontend is on a different port.
=======
>>>>>>> c94aaa1 (althub main v2)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
<<<<<<< HEAD
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
=======
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: connectSrcOrigins,
>>>>>>> c94aaa1 (althub main v2)
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

<<<<<<< HEAD
=======
if (isProduction && !process.env.DISABLE_HSTS) {
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true }));
}

>>>>>>> c94aaa1 (althub main v2)
app.use(compression()); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(cookieParser());
// 3. SANITIZERS: Protect against NoSQL injection and XSS
app.use(mongoSanitize());

// --- BRUTE FORCE PROTECTION ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: {
    success: false,
    msg: "Too many login attempts. Please try again in 15 minutes."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// --- GLOBAL API RATE LIMIT (defense in depth) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { success: false, msg: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter to all /api routes
app.use('/api', apiLimiter);

<<<<<<< HEAD
// --- SMART CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://althub-student-connect.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } 

    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.log("BLOCKED BY CORS -> Origin tried:", origin);
=======
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("CORS Blocked Origin:", origin);
>>>>>>> c94aaa1 (althub main v2)
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

<<<<<<< HEAD
// --- PROTECTING LOGIN ROUTES ---
app.use("/api/adminLogin", loginLimiter);
app.use("/api/instituteLogin", loginLimiter);
app.use("/api/userLogin", loginLimiter); 
=======
// --- CSRF (Double Submit Cookie) ---
const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? 'None' : 'Lax',
  path: '/'
};

const csrfAllowlist = new Set([
  "/adminLogin",
  "/instituteLogin",
  "/userLogin",
  "/instituteForgetPassword",
  "/instituteResetPassword",
  "/forgetpassword",
  "/resetpassword",
  "/userForgetPassword",
  "/userResetPassword"
]);

const ensureCsrfCookie = (req, res, next) => {
  if (!req.cookies?.csrf_token) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, csrfCookieOptions);
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
    return res.status(403).json({ success: false, msg: "CSRF token invalid or missing" });
  }
  next();
};

app.use("/api", ensureCsrfCookie, csrfProtect);

// --- MOUNT ROUTES ---
app.post("/api/adminLogin", loginLimiter);
app.post("/api/instituteLogin", loginLimiter);
app.post("/api/userLogin", loginLimiter); 
>>>>>>> c94aaa1 (althub main v2)

// --- ROUTE MOUNTING ---
app.use("/api", user_route);
app.use("/api", event_route);
app.use("/api", institute_route);
app.use("/api", course_route);
app.use("/api", post_route);
app.use("/api", admin_route);
app.use("/api", conversation_route);
app.use("/api", message_route);
app.use("/api", education_route);
app.use("/api", experience_route);
app.use("/api", feedback_route);
app.use("/api", company_route);
app.use("/api", notification_route);
app.use("/api", financialaid_route);

// 3. IMAGE ROUTE MOUNTING
app.use("/api/images", images_route); 

// Health Check & Static Files
app.get("/", (req, res) => res.status(200).send("Althub Server is running!"));

// Fixed static path using ESM compatible __dirname
app.use(express.static(path.join(__dirname, "public")));

// Global Error Handler
app.use((err, req, res, next) => {
  // Multer / Upload Errors
  if (err && err.name === 'MulterError') {
    console.warn('Multer error:', err.message);
    // Map common Multer error codes to friendly messages
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, msg: 'File too large' });
    if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ success: false, msg: 'Unexpected file field' });
    return res.status(400).json({ success: false, msg: 'File upload error' });
  }

  console.error("Server Error Stack:", err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : (err && err.message) || 'Unknown error'
  });
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, { // Updated Syntax for ESM
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

// --- DATABASE CONNECTION & START SERVER ---
connectToMongo()
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is live on port ${port}`);
    });
  })
  .catch(err => {
    console.error('CRITICAL: Failed to connect to MongoDB:', err.message);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
});

export default app;