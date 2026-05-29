// src/utils/asyncHandler.js
// Wraps async route handlers so unhandled promise rejections are forwarded
// to Express's error middleware instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
