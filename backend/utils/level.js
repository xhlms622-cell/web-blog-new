const { Op } = require('sequelize');
const { User, PointLog } = require('../models');

const LEVEL_NAMES = {
  1: '萌新', 2: '初级会员', 3: '中级会员', 4: '高级会员', 5: '资深会员',
  6: '元老', 7: '大神', 8: '传奇', 9: '至尊', 10: '神话'
};

const getLevelByExperience = (exp) => {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
};

const getRequiredExperience = (level) => {
  return (level - 1) * (level - 1) * 100;
};

const getLevelName = (level) => {
  return LEVEL_NAMES[level] || `Lv.${level}`;
};

// 经验类型配置：{ exp, cooldown, dailyType }
const EXP_CONFIG = {
  post:          { exp: 20, cooldown: 60, dailyType: 'post' },
  comment:       { exp: 10, cooldown: 30, dailyType: 'comment' },
  like_received: { exp: 5,  cooldown: 0,  dailyType: 'like_received' },
  daily_login:   { exp: 10, cooldown: 0,  dailyType: 'daily_login' },
  favorited:     { exp: 8,  cooldown: 0,  dailyType: 'favorited' },
  checkin:       { exp: 5,  cooldown: 0,  dailyType: 'checkin' }
};

const DAILY_LIMIT = 500;
const DAILY_LIKE_LIMIT = 100;

// 检查冷却：最近 N 秒内是否有同类型记录
const checkCooldown = async (userId, type, seconds) => {
  if (seconds <= 0) return true;
  const since = new Date(Date.now() - seconds * 1000);
  const recent = await PointLog.findOne({
    where: { user_id: userId, type, created_at: { [Op.gte]: since } }
  });
  return !recent;
};

// 获取今日某类型已获经验
const getDailyEarned = async (userId, type) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const result = await PointLog.sum('points', {
    where: {
      user_id: userId,
      type: type || { [Op.ne]: 'punish' },
      created_at: { [Op.gte]: todayStart }
    }
  });
  return result || 0;
};

// 获取今日总经验
const getDailyTotal = async (userId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const result = await PointLog.sum('points', {
    where: {
      user_id: userId,
      points: { [Op.gt]: 0 },
      created_at: { [Op.gte]: todayStart }
    }
  });
  return result || 0;
};

/**
 * 核心函数：授予经验
 * @param {number} userId
 * @param {string} type - 经验类型
 * @param {object} opts - { targetType, targetId, description }
 * @returns {{ success: boolean, message: string, exp?: number }}
 */
const awardExperience = async (userId, type, opts = {}) => {
  const config = EXP_CONFIG[type];
  if (!config) return { success: false, message: '未知经验类型' };

  const { exp, cooldown, dailyType } = config;

  // 1. 冷却检查
  if (cooldown > 0) {
    const canProceed = await checkCooldown(userId, type, cooldown);
    if (!canProceed) {
      return { success: false, message: `操作过于频繁，请 ${cooldown} 秒后再试` };
    }
  }

  // 2. 每日总上限检查
  const dailyTotal = await getDailyTotal(userId);
  if (dailyTotal >= DAILY_LIMIT) {
    return { success: false, message: '今日经验已达上限' };
  }

  // 3. 点赞类每日上限检查
  if (type === 'like_received') {
    const dailyLike = await getDailyEarned(userId, 'like_received');
    if (dailyLike >= DAILY_LIKE_LIMIT) {
      return { success: false, message: '今日点赞经验已达上限' };
    }
  }

  // 4. 每日唯一性检查（daily_login / checkin）
  if (type === 'daily_login' || type === 'checkin') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existing = await PointLog.findOne({
      where: { user_id: userId, type, created_at: { [Op.gte]: todayStart } }
    });
    if (existing) {
      return { success: false, message: type === 'checkin' ? '今日已签到' : '今日已领取登录经验' };
    }
  }

  // 5. 同一目标唯一性检查（like_received / favorited）
  if ((type === 'like_received' || type === 'favorited') && opts.targetId) {
    const existing = await PointLog.findOne({
      where: {
        user_id: userId, type,
        target_type: opts.targetType || 'post',
        target_id: opts.targetId
      }
    });
    if (existing) {
      return { success: false, message: '已获得过该经验' };
    }
  }

  // 6. 确保不超过每日上限
  const actualExp = Math.min(exp, DAILY_LIMIT - dailyTotal);
  if (actualExp <= 0) {
    return { success: false, message: '今日经验已达上限' };
  }

  // 7. 写入记录，更新用户
  await PointLog.create({
    user_id: userId,
    points: actualExp,
    type,
    target_type: opts.targetType || null,
    target_id: opts.targetId || null,
    description: opts.description || null
  });

  const user = await User.findByPk(userId);
  await user.increment({ experience: actualExp, points: actualExp });

  // 8. 重算等级
  const newLevel = getLevelByExperience(user.experience + actualExp);
  if (newLevel !== user.level) {
    await user.update({ level: newLevel });
  }

  return { success: true, message: `+${actualExp} 经验`, exp: actualExp, level: newLevel };
};

// 获取等级进度信息
const getLevelProgress = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'level', 'experience', 'points']
  });
  if (!user) return null;

  const currentLevel = user.level;
  const currentExp = user.experience;
  const currentRequired = getRequiredExperience(currentLevel);
  const nextRequired = getRequiredExperience(currentLevel + 1);
  const levelName = getLevelName(currentLevel);
  const nextLevelName = getLevelName(currentLevel + 1);

  const progress = nextRequired > currentRequired
    ? Math.round(((currentExp - currentRequired) / (nextRequired - currentRequired)) * 100)
    : 100;

  const dailyTotal = await getDailyTotal(userId);

  // 检查今日是否已签到
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCheckin = await PointLog.findOne({
    where: { user_id: userId, type: 'checkin', created_at: { [Op.gte]: todayStart } }
  });

  return {
    level: currentLevel,
    levelName,
    nextLevelName,
    experience: currentExp,
    points: user.points,
    currentRequired,
    nextRequired,
    progress: Math.min(progress, 100),
    dailyEarned: dailyTotal,
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: DAILY_LIMIT - dailyTotal,
    checkedIn: !!todayCheckin
  };
};

module.exports = {
  getLevelByExperience,
  getRequiredExperience,
  getLevelName,
  getLevelProgress,
  awardExperience,
  checkCooldown,
  getDailyEarned,
  getDailyTotal,
  LEVEL_NAMES,
  EXP_CONFIG,
  DAILY_LIMIT
};
