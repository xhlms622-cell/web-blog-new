const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('密码长度需要在6-20个字符之间'),
  body('nickname')
    .isLength({ min: 2, max: 20 })
    .withMessage('昵称长度需要在2-20个字符之间')
    .trim()
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
];

module.exports = {
  registerValidator,
  loginValidator
};
