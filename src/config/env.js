// src/config/env.js
// Validates all required environment variables at startup.
// App will crash with a clear message if anything is missing/invalid.
require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV:       z.enum(['development', 'production', 'test']).default('development'),
  PORT:           z.string().default('5000'),
  CLIENT_URL:     z.string().default('http://localhost:5000'),
  DATABASE_URL:   z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET:     z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  REDIS_URL:      z.string().default('redis://localhost:6379'),
  MAIL_HOST:      z.string().default('smtp.mailtrap.io'),
  MAIL_PORT:      z.string().default('2525'),
  MAIL_USER:      z.string().default(''),
  MAIL_PASS:      z.string().default(''),
  MAIL_FROM:      z.string().default('noreply@example.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
