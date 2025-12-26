const express = require('express');
const router = express.Router(); 
const gridfs = require('../db/storage'); // Connects to your existing storage helper
const { requireAuth } = require('../middleware/authMiddleware'); // Connects to your security check

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  if (filename.endsWith('.mp4')) return 'video/mp4';
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.ogg')) return 'video/ogg';
  if (filename.endsWith('.mov')) return 'video/quicktime';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.gif')) return 'image/gif';
  if (filename.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
};

// --- SECURED IMAGE ROUTE ---
// GET /api/images/:id?token=YOUR_TOKEN
router.get('/images/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    
    // 1. Security Check: Valid MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send({ success: false, msg: 'Invalid File ID format' });
    }

    // 2. Fetch File Metadata from GridFS
    const file = await gridfs.getFileInfo(id);
    
    if (!file) {
      return res.status(404).send({ success: false, msg: 'File not found' });
    }

    // 3. Robust Content-Type Detection
    let contentType = file.contentType;
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = getMimeType(file.filename);
    }

    // 4. Handle Video Range Requests (Seeking in video) vs Standard Images
    const range = req.headers.range;

    if (range) {
      // --- VIDEO STREAMING (Chunked) ---
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

      // Pass start/end options to your storage.js helper
      gridfs.streamToResponse(id, res, { start, end: end + 1 });

    } else {
      // --- STANDARD IMAGE/FILE DOWNLOAD ---
      res.writeHead(200, {
        'Content-Length': file.length,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=31536000' // Cache for 1 year, but PRIVATE (user only)
      });
      
      gridfs.streamToResponse(id, res);
    }

  } catch (err) {
    console.error('Error streaming file:', err.message);
    if (!res.headersSent) {
      res.status(500).send({ success: false, msg: err.message });
    }
  }
});

module.exports = router;