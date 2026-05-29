// src/jobs/emailJob.js
// Registers the Bull processor for the email queue.
// Call queueEmail() instead of sendMail() to make email sending async.
const { emailQueue } = require('./queue');
const { sendMail }   = require('../config/mailer');
const logger         = require('../config/logger');

// Register the processor — this runs for each job dequeued
emailQueue.process(async (job) => {
  logger.info(`Processing email job ${job.id}`, { to: job.data.to });
  await sendMail(job.data);
});

/**
 * Add an email to the queue (non-blocking).
 * @param {{ to: string, subject: string, html: string }} mailOptions
 */
const queueEmail = async (mailOptions) => {
  const job = await emailQueue.add(mailOptions);
  logger.info(`Email queued`, { jobId: job.id, to: mailOptions.to });
  return job;
};

module.exports = { queueEmail };
