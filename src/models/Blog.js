const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' }, slug: String, excerpt: String, content: String,
  category: String, thumbnail: String, featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }, tags: [String],
  readTime: { type: Number, default: 5 }, likes: { type: Number, default: 0 }, bookmarks: { type: Number, default: 0 },
  comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String, createdAt: { type: Date, default: Date.now } }],
  status: { type: String, default: 'draft' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Blog', blogSchema);

