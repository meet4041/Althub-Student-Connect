import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  jti: { type: String, required: true, unique: true },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('RefreshToken', RefreshTokenSchema);
