const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/auth', require('./auth'));
router.use('/tiebas', require('./tieba'));
router.use('/posts', require('./post'));
router.use('/comments', require('./comment'));
router.use('/search', require('./search'));
router.use('/upload', require('./upload'));
router.use('/users', require('./user'));
router.use('/notifications', require('./notification'));
router.use('/chat', require('./chat'));
router.use('/admin', require('./admin'));
router.use('/reports', require('./report'));
router.use('/level', require('./level'));
router.use('/tiebas/:tiebaId/owner', require('./barOwner'));

module.exports = router;
