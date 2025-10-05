const config = require('../config/config');

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireAdmin = authorize(config.roles.ADMIN);
const requireAgent = authorize(config.roles.AGENT, config.roles.ADMIN);
const requireUser = authorize(config.roles.USER, config.roles.AGENT, config.roles.ADMIN);

module.exports = {
  authorize,
  requireAdmin,
  requireAgent,
  requireUser
};
