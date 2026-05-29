// src/middlewares/cache.middleware.js
// Per-user Redis cache for GET endpoints.
// Gracefully degrades — if Redis is down, requests pass through normally.
const redis  = require('../config/redis');
const logger = require('../config/logger');

/**
 * Cache middleware
 * @param {number} [ttlSeconds=60]
 * Usage: router.get('/tasks', authenticate, cache(60), controller)
 */
const cache = (ttlSeconds = 60) => async (req, res, next) => {
  const key = `cache:${req.user?.id || 'anon'}:${req.originalUrl}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug(`Cache HIT: ${key}`);
      return res.json(JSON.parse(cached));
    }

    logger.debug(`Cache MISS: ${key}`);

    // Intercept res.json to store the response in Redis
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await redis.setex(key, ttlSeconds, JSON.stringify(body));
      } catch (e) {
        logger.warn('Failed to write cache', { key, error: e.message });
      }
      return originalJson(body);
    };

    next();
  } catch (err) {
    logger.warn('Cache middleware error — bypassing', { error: err.message });
    next(); // never block the request on cache failure
  }
};

/**
 * Invalidate all cache keys matching a glob pattern.
 * @param {string} pattern e.g. 'cache:userId123:*'
 */
const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Cache invalidated: ${keys.length} keys matching "${pattern}"`);
    }
  } catch (err) {
    logger.warn('Cache invalidation failed', { pattern, error: err.message });
  }
};

module.exports = { cache, invalidateCache };
