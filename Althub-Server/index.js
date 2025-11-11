require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { connectToMongo } = require("./db/conn");
const cookieParser = require("cookie-parser");
const port = 5001;
const cors = require("cors");

// Configure CORS dynamically for deployment
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";

// Note: we'll initialize DB before starting the server further below to ensure GridFS is ready

//routes
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

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
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

app.get("/", (req, res) => {
  res.send("Althub Server is running!");
});

// Serve static files
app.use(express.static("public"));

// Error handling middleware (must be after routes, before 404)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler for undefined routes (must be last)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize Socket.IO
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigin,
  },
});

//socket server--------------------
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    // console.log("a user connected!");

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    socket.on("disconnect", () => {
      // console.log("user disconnected");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text, time }) => {
      const user = getUser(receiverId);
      if (user && user.socketId) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
          time,
        });
      } else {
        // console.log("Invalid user or socketId not found.");
      }
    });

    socket.on("sendNotification", ({ receiverid, title, msg}) => {
      const user = getUser(receiverid);

      if (user && user.socketId) {
        io.to(user.socketId).emit("getNotification", {
          title,
          msg,
        });
      } else {
        // console.log("Invalid user or socketId not found.");
      }
    });
  });

// Start the server only after DB connection is ready so GridFS bucket is initialized
connectToMongo().then(() => {
  server.listen(port, function () {
    console.log(`Server is ready on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
  process.exit(1);
});

module.exports = app;
