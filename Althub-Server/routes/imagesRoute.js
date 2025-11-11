const express = require('express');
const router = express();
const gridfs = require('../db/storage');

// Stream image by GridFS id
router.get('/images/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const info = await gridfs.getFileInfo(id);
    if (!info) return res.status(404).send({ success: false, msg: 'File not found' });
    // set appropriate headers
    if (info.contentType) res.set('Content-Type', info.contentType);
    res.set('Content-Length', info.length || undefined);
    gridfs.streamToResponse(id, res);
  } catch (err) {
    console.error('Error streaming image', err.message);
    res.status(500).send({ success: false, msg: err.message });
  }
});

module.exports = router;
