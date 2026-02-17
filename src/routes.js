const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/task/task.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
