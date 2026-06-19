const mongoose = require('mongoose');
module.exports = mongoose.model('Resource', new mongoose.Schema({
  title: String, description: String,
  type: { type: String, enum: ['document', 'video', 'link', 'file'] },
  url: String, fileSize: Number, category: String,
  downloadable: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
