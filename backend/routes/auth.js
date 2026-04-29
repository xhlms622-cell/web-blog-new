const express = require('express');
const router = express.Router();
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middlewares/validator');
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/profile', auth, authController.getProfile);
router.post('/refresh', auth, authController.refreshToken);

module.exports = router;
