const { body } = require('express-validator');

const createTiebaValidator = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('贴吧名称长度需要在2-100个字符之间')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('贴吧描述不能超过500个字符')
    .trim(),
  body('category_id')
    .optional()
    .isInt()
    .withMessage('分类ID必须为整数')
];

const updateTiebaValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('贴吧名称长度需要在2-100个字符之间')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('贴吧描述不能超过500个字符')
    .trim(),
  body('category_id')
    .optional()
    .isInt()
    .withMessage('分类ID必须为整数')
];

module.exports = {
  createTiebaValidator,
  updateTiebaValidator
};
