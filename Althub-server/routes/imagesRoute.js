import express from 'express';
const router = express.Router();

import * as gridfs from '../db/conn.js';
import { requireImageAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { badRequest, notFound } from '../utils/httpError.js';

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.gif')) return 'image/gif';
  if (filename.endsWith('.pdf')) return 'application/pdf';
  if (filename.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
};

// GridFS files are content-addressed (immutable per _id), so we can cache aggressively.
// `private` because images may be auth-gated — must not be cached by shared proxies/CDNs.
const IMAGE_CACHE_CONTROL = 'private, max-age=31536000, immutable';

router.get('/:id', requireImageAuth, asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw badRequest('Invalid ID format');
  }

  const file = await gridfs.getFileInfo(id);
  if (!file) {
    throw notFound('File not found in DB');
  }

  const etag = `"${file._id.toString()}"`;
  const lastModified = file.uploadDate ? new Date(file.uploadDate).toUTCString() : null;

  res.setHeader('Cache-Control', IMAGE_CACHE_CONTROL);
  res.setHeader('ETag', etag);
  if (lastModified) res.setHeader('Last-Modified', lastModified);

  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  const notModifiedByEtag = ifNoneMatch && ifNoneMatch === etag;
  const notModifiedByDate =
    !ifNoneMatch && ifModifiedSince && lastModified &&
    new Date(ifModifiedSince).getTime() >= new Date(lastModified).getTime();

  if (notModifiedByEtag || notModifiedByDate) {
    res.status(304).end();
    return;
  }

  const range = req.headers.range;
  const contentType = file.contentType || getMimeType(file.filename);

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
    });
    gridfs.streamToResponse(id, res);
  }
}));

export default router;
