const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require("dotenv").config();

// Cache the connection to reuse in serverless environments
let cachedConnection = null;
let gridFSBucket = null;

// Initialize multer-gridfs storage (will fall back to memory storage on error)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/althub';
let storage;
try {
  storage = new GridFsStorage({
    url: mongoURI,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const filename = Date.now() + '-' + file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: { originalname: file.originalname }
        };
        resolve(fileInfo);
      });
    }
  });
  console.log('GridFS storage engine initialized');
} catch (err) {
  console.error('Failed to initialize GridFS storage engine:', err.message);
  storage = multer.memoryStorage();
}

function uploadSingle(fieldName) {
  return multer({ storage }).single(fieldName);
}

function uploadArray(fieldName, maxCount) {
  return multer({ storage }).array(fieldName, maxCount);
}

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

    // Configure mongoose for serverless
    mongoose.set("strictQuery", false);

    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    cachedConnection = connection;

    // Initialize GridFS Bucket immediately after successful connect
    try {
      const db = connection.connection ? connection.connection.db : mongoose.connection.db;
      gridFSBucket = new GridFSBucket(db, { bucketName: 'uploads' });
    } catch (err) {
      console.error('Failed to initialize GridFSBucket', err.message);
    }

    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

// Export GridFS bucket getter
const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS Bucket not initialized. Ensure connectToMongo() was called first.');
  }
  return gridFSBucket;
};

// GridFS helper functions
async function uploadFromBuffer(buffer, filename, contentType) {
  const bucket = getGridFSBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.end(buffer);
    uploadStream.on('finish', (file) => resolve(file._id.toString()));
    uploadStream.on('error', (err) => reject(err));
  });
}

async function getFileInfo(id) {
  const bucket = getGridFSBucket();
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  const files = await bucket.find({ _id }).toArray();
  return files && files.length > 0 ? files[0] : null;
}

function streamToResponse(id, res) {
  const bucket = getGridFSBucket();
  const _id = typeof id === 'string' ? new ObjectId(id) : id;
  const downloadStream = bucket.openDownloadStream(_id);
  downloadStream.on('error', (err) => res.status(404).send({ success: false, msg: 'File not found' }));
  downloadStream.pipe(res);
}

module.exports = {
  connectToMongo,
  getGridFSBucket,
  uploadSingle,
  uploadArray,
  uploadFromBuffer,
  getFileInfo,
  streamToResponse,
};
