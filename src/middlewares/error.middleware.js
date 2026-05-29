// src/middlewares/error.middleware.js
// Centralized error handler — MUST be registered last in app.js.
// Handles: ApiError, Prisma errors, JWT errors, and unknown 500s.
const { Prisma } = require('@prisma/client');
const logger     = require('../config/logger');
const ApiError   = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  logger.error({
    message: err.message,
    path:    req.path,
    method:  req.method,
    stack:   err.stack,
  });

  // ── Our own typed errors ────────────────────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors:  err.errors,
    });
  }

  // ── Prisma known errors ─────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `${fields} already exists`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Foreign key constraint failed' });
    }
  }

  // ── JWT errors ──────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired, please login again' });
  }

  // ── Multer errors ───────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large (max 5MB)' });
  }

  // ── Unknown — don't leak stack in production ────────────────────────────
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
