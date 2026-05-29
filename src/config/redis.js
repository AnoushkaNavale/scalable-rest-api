// src/config/redis.js
// Uses ioredis. For local dev, run: docker run -p 6379:6379 redis:7-alpine
// Free cloud option: https://redis.io/try-free (30MB free tier)
const Redis  = require('ioredis');
const logger = require('./logger');
const env    = require('./env');

const redis = new Redis(env.REDIS_URL, {
  lazyConnect:         true,
  maxRetriesPerRequest: 3,
  enableReadyCheck:    true,
  retryStrategy: (times) => {
    if (times > 5) return null; // stop retrying after 5 attempts
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error',   (e) => logger.warn('Redis connection error — caching disabled', { error: e.message }));

module.exports = redis;
