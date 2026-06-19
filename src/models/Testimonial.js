const mongoose = require('mongoose');
module.exports = mongoose.model('Testimonial', new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  role: String,
  company: String,
  content: String,
  rating: { type: Number, default: 5 },
  avatar: String,
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
