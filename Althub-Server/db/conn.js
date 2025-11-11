const mongoose = require("mongoose");
require("dotenv").config();

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

const connectToMongo = async () => {
  try {
    // If already connected, return the existing connection
    if (mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return mongoose.connection;
    }

    // If connection is cached, return it
    if (cachedConnection) {
      return cachedConnection;
    }

    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/althub";
    
    // Configure mongoose for serverless
    mongoose.set("strictQuery", false);
    
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    cachedConnection = connection;
    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Don't exit process in serverless - let it handle gracefully
    // In serverless, we want to return an error response, not crash
    throw error;
  }
};

module.exports = connectToMongo;
