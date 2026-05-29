// src/app.js
const express        = require('express');
const helmet         = require('helmet');
const cors           = require('cors');
const compression    = require('compression');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

const env                 = require('./config/env');
const { setupSwagger }    = require('./config/swagger');
const requestLogger       = require('./middlewares/requestLogger.middleware');
const errorMiddleware     = require('./middlewares/error.middleware');
const routes              = require('./routes');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      env.CLIENT_URL,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── Gzip compression (free ~60-80% size reduction) ─────────────────────────
app.use(compression());

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Global limit
app.use('/api/', rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            100,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { success: false, message: 'Too many requests, please try again in 15 minutes.' },
}));

// Stricter limit on auth routes (prevent brute force)
app.use('/api/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      15,
  message:  { success: false, message: 'Too many auth attempts, please try again later.' },
}));

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── API docs ────────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Centralized error handler (must be last) ────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
