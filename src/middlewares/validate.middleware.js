// src/middlewares/validate.middleware.js
// Drop-in replacement for express-validator — uses Zod schemas.
// Returns 422 with an array of field-level errors on failure.
const ApiError = require('../utils/ApiError');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [target='body']
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }

  // Replace with parsed/coerced data (e.g. strings → numbers for query params)
  req[target] = result.data;
  next();
};

module.exports = validate;
