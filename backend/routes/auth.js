const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middlewares/validator');
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// 登录/注册限流：每 IP 每15分钟最多10次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { code: 429, message: '登录/注册尝试过于频繁，请15分钟后再试' }
});

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.get('/profile', auth, authController.getProfile);
router.post('/refresh', auth, authController.refreshToken);

module.exports = router;
