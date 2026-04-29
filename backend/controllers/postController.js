const { Op } = require('sequelize');
const { Post, User, Tieba } = require('../models');
const ApiResponse = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, sort = 'new' } = req.query;
    const offset = (page - 1) * pageSize;
    const where = { status: 1 };

    let order;
    switch (sort) {
      case 'essence':
        where.is_essence = 1;
        order = [['created_at', 'DESC']];
        break;
      default:
        order = [['created_at', 'DESC']];
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] },
        { model: Tieba, as: 'tieba', attributes: ['id', 'name'] }
      ],
      order,
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

module.exports = { list };
