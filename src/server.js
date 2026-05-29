// src/server.js
// Load env first — crashes with clear message if vars are missing
const env    = require('./config/env');
const app    = require('./app');
const logger = require('./config/logger');
const redis  = require('./config/redis');
const prisma = require('./config/prisma');

// Register Bull email job processor
require('./jobs/emailJob');

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`📖 Swagger docs: http://localhost:${env.PORT}/api-docs`);
  logger.info(`🏠 Frontend:     http://localhost:${env.PORT}`);
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────
// Waits for in-flight requests to complete before closing connections.
// Essential for zero-downtime deploys on Render / Railway / Docker.
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      logger.info('Database disconnected');
    } catch (e) {
      logger.error('Error disconnecting DB', { error: e.message });
    }

    try {
      await redis.quit();
      logger.info('Redis disconnected');
    } catch (e) {
      logger.warn('Error disconnecting Redis', { error: e.message });
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason: String(reason) });
  // Don't crash — log and continue; let per-request asyncHandler handle it
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  shutdown('uncaughtException');
});
