import express from 'express';
const router = express.Router();

import * as gridfs from '../db/conn.js';
import { requireImageAuth } from '../middleware/authMiddleware.js';

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.gif')) return 'image/gif';
  if (filename.endsWith('.pdf')) return 'application/pdf';
  if (filename.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
};

router.get('/:id', requireImageAuth, async (req, res) => {
  try {
    const id = req.params.id;
    
    // 1. Validate ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send({ success: false, msg: 'Invalid ID format' });
    }

    // 2. Check if file exists
    const file = await gridfs.getFileInfo(id);
    if (!file) {
      return res.status(404).send({ success: false, msg: 'File not found in DB' });
    }

    // 3. Handle Streaming
    const range = req.headers.range;
    let contentType = file.contentType || getMimeType(file.filename);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      // Pass start/end to your conn.js logic via storage.js
      gridfs.streamToResponse(id, res, { start, end: end + 1 });
    } else {
      res.writeHead(200, {
        'Content-Length': file.length,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      gridfs.streamToResponse(id, res);
    }

  } catch (err) {
    console.error('Image Route Error:', err.message);
    if (!res.headersSent) res.status(500).send("Server Error");
  }
});

export default router;