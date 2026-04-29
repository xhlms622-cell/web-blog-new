const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth');
const postController = require('../controllers/postController');

router.get('/', optionalAuth, postController.list);

module.exports = router;
