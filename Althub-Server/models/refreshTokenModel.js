const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  jti: { type: String, required: true, unique: true },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
