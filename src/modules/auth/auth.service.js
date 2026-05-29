// src/modules/auth/auth.service.js
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const prisma   = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/token');
const { queueEmail } = require('../../jobs/emailJob');
const env      = require('../../config/env');

// ─── Register ────────────────────────────────────────────────────────────────
const register = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashed = await bcrypt.hash(password, 12);

  // Generate email verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, verifyToken },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Queue welcome + verification email (non-blocking)
  const verifyLink = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await queueEmail({
    to:      email,
    subject: 'Welcome — please verify your email',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <p>This link expires in 24 hours.</p>
    `,
  }).catch(() => {}); // don't fail registration if email queue is down

  return user;
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Use same error for wrong email AND wrong password (prevents user enumeration)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id:            user.id,
      name:          user.name,
      email:         user.email,
      role:          user.role,
      emailVerified: user.emailVerified,
    },
  };
};

// ─── Verify Email ────────────────────────────────────────────────────────────
const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) throw new ApiError(400, 'Invalid or already used verification token');

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerified: true, verifyToken: null },
  });
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond 200 even if user not found — prevents email enumeration
  if (!user) return;

  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email },
    data:  { resetToken: token, resetTokenExpiry: expires },
  });

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await queueEmail({
    to:      email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  }).catch(() => {});
};

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken:       token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data:  { password: hashed, resetToken: null, resetTokenExpiry: null },
  });
};

// ─── Get Me ──────────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
