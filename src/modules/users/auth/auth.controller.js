const authService = require("./auth.service");

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "email, password, name are required",
      });
    }

    const result = await authService.register({ email, password, name });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await authService.login({ email, password });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };