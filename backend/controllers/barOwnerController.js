const { Op } = require('sequelize');
const { sequelize, Post, User, Tieba, TiebaCategory, TiebaFollow, Report, Comment } = require('../models');
const ApiResponse = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const tieba = req.tieba;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPosts, totalMembers, todayNewPosts, pendingReports] = await Promise.all([
      Post.count({ where: { tieba_id: tieba.id, status: 1 } }),
      TiebaFollow.count({ where: { tieba_id: tieba.id } }),
      Post.count({ where: { tieba_id: tieba.id, status: 1, created_at: { [Op.gte]: todayStart } } }),
      Report.count({
        where: { status: 'pending' },
        include: [{
          model: Post,
          as: 'reportedPost',
          where: { tieba_id: tieba.id },
          required: true
        }]
      }).catch(() => 0)
    ]);

    res.json(ApiResponse.success({
      tiebaName: tieba.name,
      totalPosts,
      totalMembers,
      todayNewPosts,
      pendingReports
    }));
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = { tieba_id: req.tieba.id };

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) where.status = parseInt(status);

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post || post.tieba_id !== req.tieba.id) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const { is_top, is_essence, status } = req.body;
    const updates = {};
    if (is_top !== undefined) updates.is_top = is_top;
    if (is_essence !== undefined) updates.is_essence = is_essence;
    if (status !== undefined) updates.status = status;

    await post.update(updates);
    res.json(ApiResponse.success(null, '更新成功'));
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await TiebaFollow.findAndCountAll({
      where: { tieba_id: req.tieba.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'role'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    const members = rows.map(r => ({
      id: r.user.id,
      nickname: r.user.nickname,
      avatar: r.user.avatar,
      role: r.user.role,
      followed_at: r.created_at
    }));

    res.json(ApiResponse.paginate(members, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (page - 1) * pageSize;

    // 查找与本贴吧帖子相关的举报
    const posts = await Post.findAll({
      where: { tieba_id: req.tieba.id },
      attributes: ['id']
    });
    const postIds = posts.map(p => p.id);

    const where = {
      target_type: 'post',
      target_id: { [Op.in]: postIds }
    };
    if (status) where.status = status;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'nickname'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const handleReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.reportId);
    if (!report) {
      return res.status(404).json(ApiResponse.error('举报不存在', 404));
    }

    await report.update({
      status: req.body.status,
      handler_id: req.user.id,
      result: req.body.result
    });

    res.json(ApiResponse.success(null, '举报已处理'));
  } catch (error) {
    next(error);
  }
};

const getTiebaInfo = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.tieba.id, {
      include: [
        { model: TiebaCategory, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    res.json(ApiResponse.success(tieba));
  } catch (error) {
    next(error);
  }
};

const updateTiebaInfo = async (req, res, next) => {
  try {
    const { name, description, cover, category_id } = req.body;
    const updates = {};
    if (name !== undefined) {
      const existing = await Tieba.findOne({ where: { name, id: { [Op.ne]: req.tieba.id } } });
      if (existing) {
        return res.status(400).json(ApiResponse.error('贴吧名称已存在', 400));
      }
      updates.name = name;
    }
    if (description !== undefined) updates.description = description;
    if (cover !== undefined) updates.cover = cover;
    if (category_id !== undefined) updates.category_id = category_id || null;

    await req.tieba.update(updates);
    res.json(ApiResponse.success(null, '更新成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getPosts, updatePost, getMembers, getReports, handleReport, getTiebaInfo, updateTiebaInfo };
