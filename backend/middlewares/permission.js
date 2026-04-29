const ApiResponse = require('../utils/response');

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未授权访问', 401));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.error('权限不足', 403));
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json(ApiResponse.error('需要管理员权限', 403));
  }
  next();
};

const isBarOwner = async (req, res, next) => {
  try {
    const { tiebaId } = req.params;
    const { Tieba } = require('../models');

    const tieba = await Tieba.findByPk(tiebaId);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    if (tieba.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('需要吧主权限', 403));
    }

    req.tieba = tieba;
    next();
  } catch (error) {
    return res.status(500).json(ApiResponse.error('服务器错误', 500));
  }
};

module.exports = { checkRole, isAdmin, isBarOwner };
