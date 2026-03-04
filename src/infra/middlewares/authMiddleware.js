const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../shared/errors/AppError");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET .env faylida topilmadi");
  return process.env.JWT_SECRET;
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user info (including role) to req.user
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token topilmadi. Authorization header required.");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, getJwtSecret());

    req.user = {
      id: decoded.sub,
      email: decoded.email || null,
      phone: decoded.phone || null,
      role: decoded.role || 'patient'
    };
    const identifier = req.user.phone || req.user.email || req.user.id;
    console.log(`✅ Authenticated user: ${identifier} (${req.user.role})`);

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Noto'g'ri token"));
    }
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token muddati tugagan"));
    }
    return next(err);
  }
}

module.exports = authMiddleware;
