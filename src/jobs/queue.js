// src/jobs/queue.js
// Bull uses Redis for job persistence and retry logic.
// Jobs survive server restarts and are retried automatically on failure.
const Bull   = require('bull');
const logger = require('../config/logger');
const env    = require('../config/env');

const emailQueue = new Bull('emails', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,  // keep last 50 completed jobs
    removeOnFail:     100, // keep last 100 failed jobs for debugging
  },
});

emailQueue.on('completed', (job) =>
  logger.info(`Email job ${job.id} completed`, { to: job.data.to })
);
emailQueue.on('failed', (job, err) =>
  logger.error(`Email job ${job.id} failed`, { to: job.data?.to, error: err.message })
);
emailQueue.on('error', (err) =>
  logger.error('Email queue error', { error: err.message })
);

module.exports = { emailQueue };
