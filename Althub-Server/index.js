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

// 1. HELMET: Allow Cross-Origin Images
// This specific policy allows modern browsers (Chrome/Safari) to render 
// images from this server even if the frontend is on a different port.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression()); 
app.use(express.json({ limit: '10mb' })); // Increased limit for larger uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
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

// --- SMART CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://althub-student-connect.vercel.app' // Add your deployed frontend URL here
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } 

    // Dynamic check for Vercel Preview Deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.log("BLOCKED BY CORS -> Origin tried:", origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allows cookies if needed
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // 2. HEADERS: Explicitly allow 'Authorization' so ProtectedImage.js works
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

// Apply CORS globally
app.use(cors(corsOptions));
// Handle preflight requests for complex operations (like sending custom headers)
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
// This handles requests to /api/images/12345...
app.use("/api/images", images_route); 

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

module.exports = app;