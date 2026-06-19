const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const crud = require('../utils/crudFactory');
const { protect, authorize } = require('../middleware/auth');

router.get('/', crud.getAll(Project));
router.get('/featured', async (req, res) => {
  const projects = await Project.find({ featured: true, status: 'published' }).limit(8);
  res.json({ success: true, data: projects });
});
router.get('/slug/:slug', crud.getBySlug(Project));
router.get('/:id', crud.getOne(Project));
router.post('/', protect, authorize('super_admin', 'admin', 'editor'), crud.create(Project));
router.put('/:id', protect, authorize('super_admin', 'admin', 'editor'), crud.update(Project));
router.delete('/:id', protect, authorize('super_admin', 'admin'), crud.remove(Project));

module.exports = router;
