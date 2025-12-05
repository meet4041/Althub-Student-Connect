const express = require('express');
const router = express();
const gridfs = require('../db/storage');

// Helper: Guess mime type if it's missing in DB (for old files)
const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  if (filename.endsWith('.mp4')) return 'video/mp4';
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.ogg')) return 'video/ogg';
  if (filename.endsWith('.mov')) return 'video/quicktime';
  return 'application/octet-stream';
};

router.get('/images/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const file = await gridfs.getFileInfo(id);
    
    if (!file) {
      return res.status(404).send({ success: false, msg: 'File not found' });
    }

    // --- FIX 3: Robust Content-Type Detection ---
    let contentType = file.contentType;
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = getMimeType(file.filename);
    }

    // --- FIX 4: Handle Video Range Requests (Critical for Audio) ---
    const range = req.headers.range;

    if (range) {
      // 1. Parse Range Header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      // 2. Send 206 Partial Content Header
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      // 3. Stream specific chunk (MongoDB requires exclusive end, so +1)
      gridfs.streamToResponse(id, res, { start, end: end + 1 });
    } else {
      // Regular Full Content (Images)
      res.writeHead(200, {
        'Content-Length': file.length,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes', // Advertise we support ranges
        'Cache-Control': 'public, max-age=31536000'
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