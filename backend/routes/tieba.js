const express = require('express');
const router = express.Router();
const { createTiebaValidator, updateTiebaValidator } = require('../validators/tiebaValidator');
const validate = require('../middlewares/validator');
const { auth, optionalAuth } = require('../middlewares/auth');
const tiebaController = require('../controllers/tiebaController');

router.get('/categories', optionalAuth, tiebaController.getCategories);
router.get('/', optionalAuth, tiebaController.list);
router.get('/:id', optionalAuth, tiebaController.getById);
router.post('/', auth, createTiebaValidator, validate, tiebaController.create);
router.put('/:id', auth, updateTiebaValidator, validate, tiebaController.update);
router.post('/:id/follow', auth, tiebaController.follow);
router.delete('/:id', auth, tiebaController.remove);
router.get('/:id/posts', optionalAuth, tiebaController.getPosts);

module.exports = router;
