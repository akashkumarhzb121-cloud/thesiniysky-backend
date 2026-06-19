const mongoose = require('mongoose');
module.exports = mongoose.model('Achievement', new mongoose.Schema({
  title: { type: String, default: 'New Achievement' },
  description: String,
  value: { type: String, default: '0' },
  icon: String,
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
