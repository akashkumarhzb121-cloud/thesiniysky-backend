const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' }, slug: String, description: String, content: String,
  category: String, featured: { type: Boolean, default: false }, thumbnail: String,
  gallery: [String], technologies: [String], liveUrl: String, githubUrl: String,
  clientName: String, startDate: Date, endDate: Date,
  status: { type: String, default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Project', projectSchema);
