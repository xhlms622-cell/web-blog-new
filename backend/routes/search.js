const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth');
const searchController = require('../controllers/searchController');

router.get('/', optionalAuth, searchController.search);

module.exports = router;
