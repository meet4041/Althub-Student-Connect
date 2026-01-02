import mongoose from "mongoose";
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

let cachedConnection = null;
let gridFSBucket = null;
const mongoURI = process.env.MONGO_URI;
const storage = multer.memoryStorage();

// Allowed MIME types (images + common videos)
const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
];

const DEFAULT_MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || `${20 * 1024 * 1024}`, 10); // 20MB

function createMulter(fieldName, options = {}) {
  const maxFileSize = options.maxFileSize || DEFAULT_MAX_FILE_SIZE;
  const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }
    cb(null, true);
  };

  return multer({ storage, limits: { fileSize: maxFileSize }, fileFilter });
}

function uploadSingle(fieldName, options = {}) {
  return createMulter(fieldName, options).single(fieldName);
}

function uploadArray(fieldName, maxCount = 5, options = {}) {
  return createMulter(fieldName, options).array(fieldName, maxCount);
}

export const connectToMongo = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      if (!gridFSBucket) {
         const db = mongoose.connection.db;
         // Ensure db is available before creating bucket
         if (db) {
            gridFSBucket = new GridFSBucket(db, { bucketName: 'uploads' });
         }
      }
      console.log("Using existing MongoDB connection");
      return mongoose.connection;
    }

    if (cachedConnection) {
      return cachedConnection;
    }

    mongoose.set("strictQuery", false);

    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;

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

export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS Bucket not initialized. Ensure connectToMongo() was called first.');
  }
  return gridFSBucket;
};

export async function uploadFromBuffer(buffer, filename, contentType) {
  const bucket = getGridFSBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.end(buffer);
    uploadStream.on('finish', (file) => resolve(file._id.toString()));
    uploadStream.on('error', (err) => reject(err));
  });
}

export async function getFileInfo(id) {
  const bucket = getGridFSBucket();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const _id = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  const files = await bucket.find({ _id }).toArray();
  return files && files.length > 0 ? files[0] : null;
}

export function streamToResponse(id, res, options = {}) {
  const bucket = getGridFSBucket();
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Invalid ID');

  const _id = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  
  const downloadStream = bucket.openDownloadStream(_id, options);
  
  downloadStream.on('error', (err) => {
    if (!res.headersSent) {
      res.status(404).send({ success: false, msg: 'File not found' });
    }
  });
  
  downloadStream.pipe(res);
}