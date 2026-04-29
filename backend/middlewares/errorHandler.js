const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json(
      ApiResponse.error('数据验证失败', 400, err.errors.map(e => ({
        field: e.path,
        message: e.message
      })))
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(
      ApiResponse.error('数据已存在', 400, err.errors.map(e => ({
        field: e.path,
        message: e.message
      })))
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('Token无效', 401));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('Token已过期', 401));
  }

  return res.status(500).json(ApiResponse.error(err.message || '服务器内部错误', 500));
};

const notFound = (req, res) => {
  res.status(404).json(ApiResponse.error('接口不存在', 404));
};

module.exports = { errorHandler, notFound };
