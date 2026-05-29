// src/modules/upload/upload.routes.js
const express      = require('express');
const router       = express.Router();
const path         = require('path');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse  = require('../../utils/ApiResponse');
const ApiError     = require('../../utils/ApiError');
const upload       = require('../../middlewares/upload.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file (image or PDF, max 5MB)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: File uploaded successfully }
 *       413: { description: File too large }
 *       415: { description: Unsupported file type }
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file provided');

    res.json(
      new ApiResponse(200, {
        filename:     req.file.filename,
        originalName: req.file.originalname,
        mimetype:     req.file.mimetype,
        size:         req.file.size,
        url:          `/uploads/${req.file.filename}`,
      }, 'File uploaded successfully')
    );
  })
);

module.exports = router;
