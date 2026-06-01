const { body } = require('express-validator');

exports.registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').notEmpty().trim()
];

exports.loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];
