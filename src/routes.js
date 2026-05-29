// src/routes.js
const express = require('express');
const router  = express.Router();

router.use('/auth',   require('./modules/auth/auth.routes'));
router.use('/tasks',  require('./modules/task/task.routes'));
router.use('/upload', require('./modules/upload/upload.routes'));

// Health check — useful for Docker/Render health probes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
