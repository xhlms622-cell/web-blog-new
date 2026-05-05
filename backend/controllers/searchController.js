const { Op } = require('sequelize');
const { Post, Tieba, User } = require('../models');
const ApiResponse = require('../utils/response');

const search = async (req, res, next) => {
  try {
    const { keyword, type = 'all', page = 1, pageSize = 20 } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json(ApiResponse.error('请输入搜索关键词', 400));
    }

    const kw = keyword.trim();
    const offset = (page - 1) * pageSize;
    const result = {};

    if (type === 'all' || type === 'post') {
      const { count, rows } = await Post.findAndCountAll({
        where: {
          status: 1,
          [Op.or]: [
            { title: { [Op.like]: `%${kw}%` } },
            { content: { [Op.like]: `%${kw}%` } }
          ]
        },
        include: [
          { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
          { model: Tieba, as: 'tieba', attributes: ['id', 'name'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset: parseInt(offset)
      });
      result.posts = { list: rows, total: count };
    }

    if (type === 'all' || type === 'tieba') {
      const tiebas = await Tieba.findAll({
        where: {
          status: 1,
          name: { [Op.like]: `%${kw}%` }
        },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar'] }
        ],
        order: [['member_count', 'DESC']],
        limit: parseInt(pageSize)
      });
      result.tiebas = tiebas;
    }

    if (type === 'all' || type === 'user') {
      const users = await User.findAll({
        where: {
          status: 1,
          nickname: { [Op.like]: `%${kw}%` }
        },
        attributes: ['id', 'nickname', 'avatar', 'signature', 'level', 'points'],
        limit: parseInt(pageSize)
      });
      result.users = users;
    }

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
