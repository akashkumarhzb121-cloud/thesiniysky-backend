const mongoose = require('mongoose');
module.exports = mongoose.model('Contact', new mongoose.Schema({
  name: String, email: String, subject: String, message: String, phone: String,
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
}));
