const { body } = require('express-validator');

const createCommentValidator = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('评论内容长度需要在1-2000个字符之间')
    .trim(),
  body('post_id')
    .isInt()
    .withMessage('帖子ID无效')
];

const createReplyValidator = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('回复内容长度需要在1-500个字符之间')
    .trim(),
  body('comment_id')
    .isInt()
    .withMessage('评论ID无效')
];

module.exports = { createCommentValidator, createReplyValidator };
