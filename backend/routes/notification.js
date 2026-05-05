const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.list);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
