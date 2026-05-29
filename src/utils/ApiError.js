// src/utils/ApiError.js
// Custom error class — lets error middleware return correct HTTP status codes
// without leaking stack traces to clients.
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors     = errors;
    this.success    = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
