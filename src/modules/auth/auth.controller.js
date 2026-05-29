// src/modules/auth/auth.controller.js
const asyncHandler  = require('../../utils/asyncHandler');
const ApiResponse   = require('../../utils/ApiResponse');
const authService   = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, user, 'Registration successful. Check your email to verify your account.'));
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json(new ApiResponse(200, data, 'Login successful'));
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.json(new ApiResponse(200, null, 'Email verified successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always 200 to prevent email enumeration
  res.json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent'));
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json(new ApiResponse(200, null, 'Password reset successful'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json(new ApiResponse(200, user));
});

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
