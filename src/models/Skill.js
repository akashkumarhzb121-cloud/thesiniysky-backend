const mongoose = require('mongoose');
module.exports = mongoose.model('Skill', new mongoose.Schema({
  name: { type: String, default: 'New Skill' },
  category: { type: String, default: 'General' },
  proficiency: { type: Number, default: 80 },
  icon: String,
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
