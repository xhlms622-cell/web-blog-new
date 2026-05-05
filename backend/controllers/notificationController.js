const { Notification } = require('../models');
const ApiResponse = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, is_read } = req.query;
    const offset = (page - 1) * pageSize;
    const where = { user_id: req.user.id };

    if (type) where.type = type;
    if (is_read !== undefined) where.is_read = parseInt(is_read);

    const { count, rows } = await Notification.findAndCountAll({
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

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.id, is_read: 0 }
    });
    res.json(ApiResponse.success({ count }));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json(ApiResponse.error('通知不存在', 404));
    }

    await notification.update({ is_read: 1 });
    res.json(ApiResponse.success(null, '已标记已读'));
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: 1 },
      { where: { user_id: req.user.id, is_read: 0 } }
    );
    res.json(ApiResponse.success(null, '全部已读'));
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getUnreadCount, markAsRead, markAllAsRead };
