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

// --- SECURITY & SERVER CONFIGURATION ---
// Required for Render/Vercel to handle secure cookies correctly behind proxies
app.set("trust proxy", 1); 

// 1. HELMET: Allow Cross-Origin Images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression()); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(cookieParser());

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

// --- CORS CONFIGURATION ---
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
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- PROTECTING LOGIN ROUTES ---
app.use("/api/adminLogin", loginLimiter);
app.use("/api/instituteLogin", loginLimiter);
app.use("/api/userLogin", loginLimiter); 

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
  console.error("Server Error Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message
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