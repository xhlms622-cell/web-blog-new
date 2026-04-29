const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      ApiResponse.error('参数验证失败', 400, errors.array().map(e => ({
        field: e.path,
        message: e.msg
      })))
    );
  }
  next();
};

module.exports = validate;
