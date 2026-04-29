const getLevelByExperience = (exp) => {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
};

const getRequiredExperience = (level) => {
  return (level - 1) * (level - 1) * 100;
};

const LEVEL_NAMES = {
  1: '萌新',
  2: '初级会员',
  3: '中级会员',
  4: '高级会员',
  5: '资深会员',
  6: '元老',
  7: '大神',
  8: '传奇',
  9: '至尊',
  10: '神话'
};

const getLevelName = (level) => {
  return LEVEL_NAMES[level] || `Lv.${level}`;
};

module.exports = {
  getLevelByExperience,
  getRequiredExperience,
  getLevelName,
  LEVEL_NAMES
};
