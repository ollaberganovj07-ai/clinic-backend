const express = require('express');
const usersController = require('./users.controller');

const router = express.Router();

/**
 * Users module health check
 * GET /api/users/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'users ok' });
});

/**
 * GET /api/users
 */
router.get('/', usersController.list);

/**
 * GET /api/users/:id
 */
router.get('/:id', usersController.getById);

/**
 * POST /api/users
 */
router.post('/', usersController.create);

/**
 * PUT /api/users/:id
 */
router.put('/:id', usersController.update);

/**
 * DELETE /api/users/:id
 */
router.delete('/:id', usersController.remove);

module.exports = router;