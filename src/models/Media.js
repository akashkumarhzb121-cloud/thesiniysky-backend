const mongoose = require('mongoose');
module.exports = mongoose.model('Media', new mongoose.Schema({
  filename: String, originalName: String, url: String, mimeType: String,
  size: Number, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
