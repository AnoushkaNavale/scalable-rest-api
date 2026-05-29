// src/middlewares/auth.middleware.js
const { verifyToken } = require('../utils/token');
const ApiError        = require('../utils/ApiError');
const asyncHandler    = require('../utils/asyncHandler');
const prisma          = require('../config/prisma');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }

  const token = header.split(' ')[1];
  const decoded = verifyToken(token); // throws JsonWebTokenError / TokenExpiredError

  // Verify user still exists in DB
  const user = await prisma.user.findUnique({
    where:  { id: decoded.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true },
  });

  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

module.exports = { authenticate };
