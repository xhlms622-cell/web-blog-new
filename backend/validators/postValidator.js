const { body } = require('express-validator');

const createPostValidator = [
  body('title')
    .isLength({ min: 2, max: 200 })
    .withMessage('标题长度需要在2-200个字符之间')
    .trim(),
  body('content')
    .isLength({ min: 1 })
    .withMessage('内容不能为空')
    .trim(),
  body('tieba_id')
    .isInt()
    .withMessage('请选择贴吧')
];

module.exports = { createPostValidator };
