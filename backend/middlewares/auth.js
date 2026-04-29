const { verifyToken } = require('../utils/token');
const ApiResponse = require('../utils/response');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error('未授权访问', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json(ApiResponse.error('Token无效或已过期', 401));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.error('认证失败', 401));
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };
