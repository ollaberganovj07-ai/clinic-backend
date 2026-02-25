const usersService = require('./users.service');

/**
 * GET /api/users
 */
async function list(req, res, next) {
  try {
    const users = await usersService.list();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/users/:id
 */
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const user = await usersService.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/users
 */
async function create(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const user = await usersService.create({ name });

    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/users/:id
 */
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // req.body emas, faqat kerakli field yuboramiz (production safe)
    const updatedUser = await usersService.update(id, { name });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/users/:id
 */
async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);

    const deleted = await usersService.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };