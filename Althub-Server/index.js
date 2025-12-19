require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const helmet = require("helmet"); // Added for security headers
const { connectToMongo } = require("./db/conn");

const app = express();
const port = process.env.PORT || 5001;

// --- SECURITY & SERVER CONFIGURATION ---
// Required for Render to handle secure cookies over HTTPS
app.set("trust proxy", 1); 

app.use(helmet()); // Protects against common web vulnerabilities
app.use(compression()); // Compresses responses for better performance
app.use(express.json());
app.use(cookieParser());

// --- SECURE CORS CONFIGURATION ---
// Add any additional staging or production URLs to this list
const allowedOrigins = [
  'https://althub-student-connect.vercel.app', 
  'https://althub-admin.vercel.app', // Added admin panel origin
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Crucial for sending/receiving secure JWT cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight requests

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
app.use("/api", images_route);

// Health Check & Static Files
app.get("/", (req, res) => res.status(200).send("Althub Server is running!"));
app.use(express.static("public"));

// Global Error Handler (Must be after all routes)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message
  });
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true // Crucial for cookie-based auth in Socket.io
  },
  transports: ["websocket", "polling"]
});

let users = [];

const addUser = (userId, socketId) => {
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
  console.log(`New connection: ${socket.id}`);

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
    console.log(`Disconnected: ${socket.id}`);
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
    process.exit(1); // Stop server if database connection fails
  });

// Handle unhandled rejections globally
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;