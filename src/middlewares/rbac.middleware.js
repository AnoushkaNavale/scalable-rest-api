// src/middlewares/rbac.middleware.js
const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control middleware.
 * Usage: router.get('/admin', authenticate, authorize('ADMIN'), controller)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied — requires role: ${roles.join(' or ')}`));
  }
  next();
};

module.exports = { authorize };
