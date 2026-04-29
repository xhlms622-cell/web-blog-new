const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/auth', require('./auth'));
router.use('/tiebas', require('./tieba'));
router.use('/posts', require('./post'));

module.exports = router;
