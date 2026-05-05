const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const levelController = require('../controllers/levelController');

router.get('/info', auth, levelController.getLevelInfo);
router.get('/history', auth, levelController.getExpHistory);
router.get('/rules', levelController.getRules);
router.post('/checkin', auth, levelController.checkIn);

module.exports = router;
