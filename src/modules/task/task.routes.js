const express = require('express');
const controller = require('./task.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', controller.createTask);
router.get('/', controller.getTasks);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
