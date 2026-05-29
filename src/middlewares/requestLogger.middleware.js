// src/middlewares/requestLogger.middleware.js
// Pipes Morgan HTTP request logs into Winston so everything goes to the same log files.
const morgan = require('morgan');
const logger = require('../config/logger');

const stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream }
);
