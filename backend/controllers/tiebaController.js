const { Op } = require('sequelize');
const { sequelize, Tieba, TiebaCategory, TiebaFollow, Post, User } = require('../models');
const ApiResponse = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = await TiebaCategory.findAll({
      order: [['sort_order', 'ASC']]
    });
    res.json(ApiResponse.success(categories));
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, category_id, keyword, sort = 'hot' } = req.query;
    const offset = (page - 1) * pageSize;
    const where = { status: 1 };

    if (category_id) {
      where.category_id = category_id;
    }

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    let order;
    switch (sort) {
      case 'new':
        order = [['created_at', 'DESC']];
        break;
      case 'member':
        order = [['member_count', 'DESC']];
        break;
      default:
        // 综合热度：帖子数*2 + 关注数
        order = [[sequelize.literal('(Tieba.post_count * 2 + Tieba.member_count)'), 'DESC']];
    }

    const { count, rows } = await Tieba.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar'] },
        { model: TiebaCategory, as: 'category', attributes: ['id', 'name'] }
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

const getById = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'avatar'] },
        { model: TiebaCategory, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    let isFollowed = false;
    if (req.user) {
      const follow = await TiebaFollow.findOne({
        where: { user_id: req.user.id, tieba_id: tieba.id }
      });
      isFollowed = !!follow;
    }

    res.json(ApiResponse.success({ ...tieba.toJSON(), isFollowed }));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, category_id } = req.body;

    const existing = await Tieba.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json(ApiResponse.error('该贴吧名称已存在', 400));
    }

    const tieba = await Tieba.create({
      name,
      description,
      category_id,
      owner_id: req.user.id,
      member_count: 1
    });

    await TiebaFollow.create({
      user_id: req.user.id,
      tieba_id: tieba.id
    });

    await User.update(
      { role: 'bar_owner' },
      { where: { id: req.user.id, role: 'user' } }
    );

    res.status(201).json(ApiResponse.success(tieba, '创建成功'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.params.id);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    if (tieba.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('需要吧主权限', 403));
    }

    const { name, description, category_id } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category_id !== undefined) updates.category_id = category_id;

    await tieba.update(updates);
    res.json(ApiResponse.success(tieba, '更新成功'));
  } catch (error) {
    next(error);
  }
};

const follow = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.params.id);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    const existing = await TiebaFollow.findOne({
      where: { user_id: req.user.id, tieba_id: tieba.id }
    });

    if (existing) {
      await existing.destroy();
      await tieba.decrement('member_count');
      res.json(ApiResponse.success({ isFollowed: false }, '已取消关注'));
    } else {
      await TiebaFollow.create({
        user_id: req.user.id,
        tieba_id: tieba.id
      });
      await tieba.increment('member_count');
      res.json(ApiResponse.success({ isFollowed: true }, '关注成功'));
    }
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const tiebaId = req.params.id;

    const tieba = await Tieba.findByPk(tiebaId);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    const { count, rows } = await Post.findAndCountAll({
      where: { tieba_id: tiebaId, status: 1 },
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] }
      ],
      order: [
        ['is_top', 'DESC'],
        ['is_essence', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.params.id);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    // 只有管理员可以删除贴吧
    if (req.user.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('需要管理员权限', 403));
    }

    await tieba.update({ status: 0 });
    res.json(ApiResponse.success(null, '贴吧已关闭'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  list,
  getById,
  create,
  update,
  follow,
  getPosts,
  remove
};
