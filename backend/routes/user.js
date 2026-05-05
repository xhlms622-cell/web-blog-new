const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/:id', optionalAuth, userController.getProfile);
router.get('/:id/posts', optionalAuth, userController.getUserPosts);
router.get('/:id/followers', optionalAuth, userController.getFollowers);
router.get('/:id/following', optionalAuth, userController.getFollowing);
router.put('/profile', auth, userController.updateProfile);
router.post('/password', auth, userController.changePassword);
router.post('/:id/follow', auth, userController.follow);

module.exports = router;
