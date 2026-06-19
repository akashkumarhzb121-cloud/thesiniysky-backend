const express = require('express');
const crud = require('../utils/crudFactory');
const { protect } = require('../middleware/auth');

function createCRUDRoutes(Model, options = {}) {
  const router = express.Router();
  router.get('/', crud.getAll(Model));
  router.get('/slug/:slug', crud.getBySlug(Model));
  router.get('/:id', crud.getOne(Model));
  router.post('/', protect, crud.create(Model));
  router.put('/:id', protect, crud.update(Model));
  router.delete('/:id', protect, crud.remove(Model));
  return router;
}

module.exports = createCRUDRoutes;
