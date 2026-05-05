const express = require('express');
const router = express.Router();
const { createReplyValidator } = require('../validators/commentValidator');
const validate = require('../middlewares/validator');
const { auth } = require('../middlewares/auth');
const commentController = require('../controllers/commentController');

router.post('/reply', auth, createReplyValidator, validate, commentController.createReply);

module.exports = router;
