// src/config/mailer.js
// Free dev option: Mailtrap (https://mailtrap.io) — 1000 emails/month free
// Free prod option: Gmail SMTP — set MAIL_HOST=smtp.gmail.com, MAIL_PORT=587
const nodemailer = require('nodemailer');
const logger     = require('./logger');
const env        = require('./env');

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: parseInt(env.MAIL_PORT),
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
    throw err;
  }
};

module.exports = { sendMail };
