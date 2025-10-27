const mongoose = require("mongoose");
require("dotenv").config();

const connectToMongo = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/althub";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
