const ApiResponse = require('../utils/response');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('请选择要上传的图片', 400));
    }

    res.json(ApiResponse.success({ url: req.file.path }, '上传成功'));
  } catch (error) {
    next(error);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(ApiResponse.error('请选择要上传的图片', 400));
    }

    const urls = req.files.map(file => file.path);

    res.json(ApiResponse.success({ urls }, '上传成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, uploadImages };
