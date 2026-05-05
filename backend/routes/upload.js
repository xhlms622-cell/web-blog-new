const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');
const { uploadImage, uploadImages } = require('../controllers/uploadController');

router.post('/image', auth, upload.single('file'), uploadImage);
router.post('/images', auth, upload.array('files', 9), uploadImages);

module.exports = router;
