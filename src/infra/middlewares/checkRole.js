const { ROLES, hasRoleLevel } = require("../../shared/constants/roles");
const { ForbiddenError, UnauthorizedError } = require("../../shared/errors/AppError");

/**
 * Check if user has required role(s)
 * @param {...string} allowedRoles - One or more roles that are allowed
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/admin-only', authMiddleware, checkRole(ROLES.ADMIN), handler);
 * router.get('/staff', authMiddleware, checkRole(ROLES.RECEPTIONIST, ROLES.ADMIN), handler);
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const userRole = req.user.role;

    if (!userRole) {
      console.error('❌ User role not found in token');
      return next(new ForbiddenError("Role ma'lumoti topilmadi"));
    }

    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      console.warn(`⚠️ Access denied: User ${req.user.email} (${userRole}) attempted to access resource requiring: ${allowedRoles.join(', ')}`);
      return next(new ForbiddenError(
        `Ruxsat berilmadi. Kerakli rol: ${allowedRoles.join(' yoki ')}`,
        { 
          required: allowedRoles, 
          current: userRole 
        }
      ));
    }

    console.log(`✅ Access granted: User ${req.user.email} (${userRole})`);
    next();
  };
}

/**
 * Check if user has minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/staff-area', authMiddleware, checkMinRole(ROLES.RECEPTIONIST), handler);
 * // This allows RECEPTIONIST, ADMIN (but not PATIENT, DOCTOR)
 */
function checkMinRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const userRole = req.user.role;

    if (!hasRoleLevel(userRole, minimumRole)) {
      console.warn(`⚠️ Access denied: User ${req.user.email} (${userRole}) needs minimum role: ${minimumRole}`);
      return next(new ForbiddenError(
        `Ruxsat berilmadi. Minimum rol: ${minimumRole}`,
        { 
          required: minimumRole, 
          current: userRole 
        }
      ));
    }

    console.log(`✅ Access granted: User ${req.user.email} (${userRole})`);
    next();
  };
}

/**
 * Check if user is accessing their own resource
 * @param {string} paramName - Name of the route parameter containing the user ID
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/users/:userId/profile', authMiddleware, checkOwnership('userId'), handler);
 */
function checkOwnership(paramName = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const resourceOwnerId = req.params[paramName];
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole === ROLES.ADMIN || requesterRole === ROLES.RECEPTIONIST) {
      console.log(`✅ Admin/Receptionist override: ${req.user.email} accessing resource`);
      return next();
    }

    if (resourceOwnerId !== requesterId) {
      console.warn(`⚠️ Ownership check failed: User ${req.user.email} (${requesterId}) tried to access resource owned by ${resourceOwnerId}`);
      return next(new ForbiddenError("O'z ma'lumotlaringizdan boshqa ma'lumotlarga kirish mumkin emas"));
    }

    console.log(`✅ Ownership verified: ${req.user.email}`);
    next();
  };
}

module.exports = {
  checkRole,
  checkMinRole,
  checkOwnership
};
