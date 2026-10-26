const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * Protect routes: verifies JWT token from Authorization header
 * Guidelines Section 6.6: "Protect routes with middleware that verifies the token or session."
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Bearer token is provided in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach current user to request (excluding password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token'
    });
  }
});

/**
 * Grant access to specific roles (Authorization)
 * Guidelines Section 6.6: "Authorization answers 'what may you do?'"
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to perform this action`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
