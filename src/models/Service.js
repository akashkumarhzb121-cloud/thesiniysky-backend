const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' }, slug: String, description: String, content: String,
  icon: String, featured: { type: Boolean, default: false }, price: Number, features: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Service', serviceSchema);
