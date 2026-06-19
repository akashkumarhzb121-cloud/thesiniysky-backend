const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true },
  displayName: { type: String },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);
