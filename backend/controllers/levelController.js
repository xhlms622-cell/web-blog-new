const { PointLog } = require('../models');
const ApiResponse = require('../utils/response');
const { getLevelProgress, awardExperience, EXP_CONFIG, DAILY_LIMIT, getLevelName, getRequiredExperience } = require('../utils/level');

const getLevelInfo = async (req, res, next) => {
  try {
    const info = await getLevelProgress(req.user.id);
    res.json(ApiResponse.success(info));
  } catch (error) {
    next(error);
  }
};

const getExpHistory = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type } = req.query;
    const offset = (page - 1) * pageSize;
    const where = { user_id: req.user.id };
    if (type) where.type = type;

    const { count, rows } = await PointLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const result = await awardExperience(req.user.id, 'checkin', {
      description: '每日签到'
    });
    if (result.success) {
      res.json(ApiResponse.success({ exp: result.exp }, result.message));
    } else {
      res.json(ApiResponse.success(null, result.message));
    }
  } catch (error) {
    next(error);
  }
};

const getRules = async (req, res, next) => {
  try {
    const rules = Object.entries(EXP_CONFIG).map(([type, config]) => ({
      type,
      exp: config.exp,
      cooldown: config.cooldown,
      description: {
        post: '发帖',
        comment: '评论',
        like_received: '收到点赞',
        daily_login: '每日登录',
        favorited: '帖子被收藏',
        checkin: '每日签到'
      }[type] || type,
      constraint: {
        post: '同一贴吧 60 秒冷却',
        comment: '全局 30 秒冷却',
        like_received: '同一帖子仅计一次',
        daily_login: '每天一次',
        favorited: '同一帖子仅计一次',
        checkin: '每天一次'
      }[type] || '无'
    }));

    const levels = [];
    for (let i = 1; i <= 20; i++) {
      levels.push({
        level: i,
        name: getLevelName(i),
        required: getRequiredExperience(i)
      });
    }

    res.json(ApiResponse.success({
      rules,
      dailyLimit: DAILY_LIMIT,
      dailyLikeLimit: 100,
      levels
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getLevelInfo, getExpHistory, checkIn, getRules };
