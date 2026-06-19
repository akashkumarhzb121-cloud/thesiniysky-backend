const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  url: String,
  mimeType: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Media', mediaSchema);
