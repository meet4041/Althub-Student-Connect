const conn = require('./conn');

module.exports = {
  uploadSingle: conn.uploadSingle,
  uploadArray: conn.uploadArray,
  uploadFromBuffer: conn.uploadFromBuffer,
  getFileInfo: conn.getFileInfo,
  streamToResponse: conn.streamToResponse,
};
