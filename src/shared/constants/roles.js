/**
 * Role-Based Access Control (RBAC) Constants
 */

const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  ADMIN: 'admin'
};

const ROLE_HIERARCHY = {
  [ROLES.PATIENT]: 1,
  [ROLES.DOCTOR]: 2,
  [ROLES.RECEPTIONIST]: 3,
  [ROLES.ADMIN]: 4
};

const ROLE_PERMISSIONS = {
  [ROLES.PATIENT]: {
    canViewOwnAppointments: true,
    canBookAppointments: true,
    canCancelOwnAppointments: true,
    canViewDoctors: true,
  },
  [ROLES.DOCTOR]: {
    canViewOwnSchedule: true,
    canManageOwnSlots: true,
    canViewOwnAppointments: true,
    canUpdateOwnProfile: true,
  },
  [ROLES.RECEPTIONIST]: {
    canViewAllDoctors: true,
    canViewAllAppointments: true,
    canBookAppointmentsForPatients: true,
    canCancelAnyAppointment: true,
    canManageServices: true,
  },
  [ROLES.ADMIN]: {
    fullAccess: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewSystemSettings: true,
    canManageAllData: true,
  }
};

/**
 * Check if a role has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
function hasPermission(userRole, permission) {
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

/**
 * Check if user role is at least the required role level
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role level
 * @returns {boolean}
 */
function hasRoleLevel(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Validate if role is valid
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRoleLevel,
  isValidRole
};
