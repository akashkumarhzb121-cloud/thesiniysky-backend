const mongoose = require('mongoose');
module.exports = mongoose.model('Experience', new mongoose.Schema({
  company: { type: String, default: 'Company Name' },
  position: { type: String, default: 'Position' },
  description: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  location: String,
  type: { type: String, default: 'full-time' },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
