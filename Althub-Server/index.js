require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); 
const { connectToMongo } = require("./db/conn");

const app = express();
const port = process.env.PORT || 5001;

// --- SECURITY & SERVER CONFIGURATION ---
// Required for Render/Vercel to handle secure cookies correctly behind proxies
app.set("trust proxy", 1); 

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression()); 
app.use(express.json({ limit: '5mb' })); // Increased limit slightly for base64 images if any
app.use(express.urlencoded({ extended: true, limit: '5mb' })); 
app.use(cookieParser());

// --- BRUTE FORCE PROTECTION ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    msg: "Too many login attempts. Please try again in 15 minutes."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// --- SMART CORS CONFIGURATION (FIXED FOR COOKIES) ---
// We explicitly define allowed origins. 
// Using an array ensures the server returns the EXACT origin in the header, 
// which is required for 'credentials: true' to work.
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://althub-student-connect.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    // 2. Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } 

    // 3. Dynamic check for Vercel Preview Deployments (Optional but useful)
    // This allows any subdomain of vercel.app (good for testing PRs)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. If nothing matches, block it
    console.log("BLOCKED BY CORS -> Origin tried:", origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // <--- CRITICAL: Allows cookies to be sent/received
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

// Apply CORS globally
app.use(cors(corsOptions));
// Handle preflight requests for complex operations
app.options('*', cors(corsOptions));

// --- ROUTE IMPORTS ---
const user_route = require("./routes/userRoute");
const event_route = require("./routes/eventRoute");
const institute_route = require("./routes/instituteRoute");
const course_route = require("./routes/courseRoute");
const feedback_route = require("./routes/feedbackRoute");
const post_route = require("./routes/postRoute");
const admin_route = require("./routes/adminRoute");
const conversation_route = require("./routes/conversationRoute");
const message_route = require("./routes/messageRoute");
const education_route = require("./routes/educationRoute");
const experience_route = require("./routes/experienceRoute");
const company_route = require("./routes/companyRoute");
const notification_route = require("./routes/notificationRoute");
const financialaid_route = require("./routes/financialaidRoute");
const images_route = require("./routes/imagesRoute");

// --- PROTECTING LOGIN ROUTES ---
// Note: Ensure these paths match your actual route definitions in route files
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
app.use("/api/images", images_route); // Mounted specifically for images if needed, or stick to /api

// Health Check & Static Files
app.get("/", (req, res) => res.status(200).send("Althub Server is running!"));
app.use(express.static("public"));

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
const io = require("socket.io")(server, {
  cors: corsOptions, // Recycle the same robust CORS options
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
  console.log("Socket connected:", socket.id);

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
    console.log("Socket disconnected:", socket.id);
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
    // Do not exit process immediately in dev, it helps debugging
    if (process.env.NODE_ENV === 'production') process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  // server.close(() => process.exit(1)); // Optional: Restart on crash
});

module.exports = app;