// Central storage facade — forwards storage and GridFS helpers from conn.js
const conn = require('./conn');

module.exports = {
  uploadSingle: conn.uploadSingle,
  uploadArray: conn.uploadArray,
  uploadFromBuffer: conn.uploadFromBuffer,
  getFileInfo: conn.getFileInfo,
  streamToResponse: conn.streamToResponse,
};
