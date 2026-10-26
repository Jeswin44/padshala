/**
 * Async handler utility to wrap route controllers
 * Eliminates repetitive try/catch blocks and passes async errors directly to next()
 * Guidelines Section 6.3: "Handle asynchronous errors so a failed database call cannot crash the server."
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
