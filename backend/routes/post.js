const express = require('express');
const router = express.Router();
const { createPostValidator } = require('../validators/postValidator');
const { createCommentValidator, createReplyValidator } = require('../validators/commentValidator');
const validate = require('../middlewares/validator');
const { auth, optionalAuth } = require('../middlewares/auth');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/', optionalAuth, postController.list);
router.get('/hot', postController.getHotPosts);
router.post('/', auth, createPostValidator, validate, postController.create);
router.get('/my', auth, postController.myPosts);
router.get('/my/favorites', auth, postController.myFavorites);
router.get('/:id', optionalAuth, postController.getById);
router.delete('/:id', auth, postController.remove);
router.post('/:id/like', auth, postController.like);
router.post('/:id/favorite', auth, postController.favorite);

// 评论相关
router.get('/:postId/comments', optionalAuth, commentController.listByPost);
router.post('/:postId/comments', auth, createCommentValidator, validate, commentController.createComment);

module.exports = router;
