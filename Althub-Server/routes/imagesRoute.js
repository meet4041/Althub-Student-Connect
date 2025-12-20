const express = require('express');
const router = express();
const gridfs = require('../db/storage');
const { requireAuth } = require('../middleware/authMiddleware'); // <--- 1. IMPORT THIS

// Helper: Guess mime type if it's missing in DB
const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  if (filename.endsWith('.mp4')) return 'video/mp4';
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.ogg')) return 'video/ogg';
  if (filename.endsWith('.mov')) return 'video/quicktime';
  return 'application/octet-stream';
};

// 2. ADD 'requireAuth' HERE vvv
router.get('/images/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Security Check: Ensure ID format is valid to prevent database injection attacks
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send({ success: false, msg: 'Invalid File ID format' });
    }

    const file = await gridfs.getFileInfo(id);
    
    if (!file) {
      return res.status(404).send({ success: false, msg: 'File not found' });
    }

    // --- FIX 3: Robust Content-Type Detection ---
    let contentType = file.contentType;
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = getMimeType(file.filename);
    }

    // --- FIX 4: Handle Video Range Requests ---
    const range = req.headers.range;

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

      gridfs.streamToResponse(id, res, { start, end: end + 1 });
    } else {
      res.writeHead(200, {
        'Content-Length': file.length,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=31536000' // Changed 'public' to 'private'
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