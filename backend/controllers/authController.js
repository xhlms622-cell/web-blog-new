const { User, PointLog } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/token');
const ApiResponse = require('../utils/response');
const { awardExperience } = require('../utils/level');

const register = async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(ApiResponse.error('该邮箱已被注册', 400));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      nickname,
      role: 'user',
      status: 1
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.status(201).json(ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        points: user.points
      },
      token,
      refreshToken
    }, '注册成功'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json(ApiResponse.error('邮箱或密码错误', 401));
    }

    if (user.status === 0) {
      return res.status(403).json(ApiResponse.error('账号已被禁用', 403));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(ApiResponse.error('邮箱或密码错误', 401));
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // 每日登录经验（异步，不阻塞响应）
    awardExperience(user.id, 'daily_login', { description: '每日登录' });

    res.json(ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        signature: user.signature,
        role: user.role,
        level: user.level,
        points: user.points,
        experience: user.experience
      },
      token,
      refreshToken
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    res.json(ApiResponse.success(user));
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    const newToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.json(ApiResponse.success({
      token: newToken,
      refreshToken: newRefreshToken
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken
};
