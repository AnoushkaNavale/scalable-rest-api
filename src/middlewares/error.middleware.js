const { Prisma } = require('@prisma/client');

exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Unique constraint violation'
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid relation reference'
      });
    }
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload'
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};
