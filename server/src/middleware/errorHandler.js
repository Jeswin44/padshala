/**
 * Centralized Error Handling Middleware
 * Captures all runtime, Mongoose, and operational errors
 * Returns consistent, sanitized JSON responses to clients
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error on server for debugging (Guidelines Section 6.3)
  console.error('Server Error:', err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      message
    });
  }

  // Mongoose Duplicate Key Error (e.g., unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with that ${field} already exists`;
    return res.status(409).json({
      success: false,
      message
    });
  }

  // Mongoose Validation Error (missing required fields, enum mismatch)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired, please log in again'
    });
  }

  // Default to 500 Internal Server Error (Never expose stack traces to client)
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server error occurred'
  });
};

module.exports = errorHandler;
