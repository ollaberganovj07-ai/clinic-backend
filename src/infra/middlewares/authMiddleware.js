const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET .env faylida topilmadi");
  return process.env.JWT_SECRET;
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to req.user
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token topilmadi. Authorization header required.",
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, getJwtSecret());

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Noto'g'ri token",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token muddati tugagan",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Autentifikatsiya xatosi",
    });
  }
}

module.exports = authMiddleware;
