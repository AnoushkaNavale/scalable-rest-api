const express = require('express');
const { body } = require('express-validator');
const controller = require('./auth.controller');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  controller.register
);

router.post('/login', controller.login);

module.exports = router;
