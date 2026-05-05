const { Report } = require('../models');
const ApiResponse = require('../utils/response');

const createReport = async (req, res, next) => {
  try {
    const { target_type, target_id, reason } = req.body;

    // 检查是否已举报过
    const existing = await Report.findOne({
      where: {
        reporter_id: req.user.id,
        target_type,
        target_id,
        status: ['pending', 'processing']
      }
    });

    if (existing) {
      return res.status(400).json(ApiResponse.error('你已举报过该内容，请等待处理', 400));
    }

    const report = await Report.create({
      reporter_id: req.user.id,
      target_type,
      target_id,
      reason
    });

    res.status(201).json(ApiResponse.success(report, '举报已提交'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport };
