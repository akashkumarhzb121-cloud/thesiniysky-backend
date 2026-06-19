const mongoose = require('mongoose');
module.exports = mongoose.model('Lead', new mongoose.Schema({
  name: String, email: String, phone: String, company: String, source: String,
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], default: 'new' },
  value: Number, notes: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));
