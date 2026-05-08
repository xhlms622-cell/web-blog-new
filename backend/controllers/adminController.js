const { Op } = require('sequelize');
const { User, Post, Comment, Tieba, Report, TiebaCategory } = require('../models');
const ApiResponse = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalPosts,
      totalTiebas,
      todayNewUsers,
      todayNewPosts,
      pendingReports
    ] = await Promise.all([
      User.count(),
      Post.count({ where: { status: 1 } }),
      Tieba.count({ where: { status: 1 } }),
      User.count({ where: { created_at: { [Op.gte]: todayStart } } }),
      Post.count({ where: { status: 1, created_at: { [Op.gte]: todayStart } } }),
      Report.count({ where: { status: 'pending' } })
    ]);

    res.json(ApiResponse.success({
      totalUsers,
      totalPosts,
      totalTiebas,
      todayNewUsers,
      todayNewPosts,
      pendingReports
    }));
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, role, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (role) where.role = role;
    if (status !== undefined) where.status = parseInt(status);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    if (user.role === 'admin') {
      return res.status(400).json(ApiResponse.error('不能修改管理员状态', 400));
    }

    await user.update({ status: req.body.status });
    res.json(ApiResponse.success(null, req.body.status === 1 ? '已启用' : '已禁用'));
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    if (user.role === 'admin') {
      return res.status(400).json(ApiResponse.error('不能修改管理员角色', 400));
    }

    await user.update({ role: req.body.role });
    res.json(ApiResponse.success(null, '角色已更新'));
  } catch (error) {
    next(error);
  }
};

const getTiebas = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    if (status !== undefined) where.status = parseInt(status);

    const { count, rows } = await Tieba.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname'] }
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

const updateTiebaStatus = async (req, res, next) => {
  try {
    const tieba = await Tieba.findByPk(req.params.id);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    await tieba.update({ status: req.body.status });
    res.json(ApiResponse.success(null, req.body.status === 1 ? '已开启' : '已关闭'));
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, status, tieba_id } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) where.status = parseInt(status);
    if (tieba_id) where.tieba_id = parseInt(tieba_id);

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname'] },
        { model: Tieba, as: 'tieba', attributes: ['id', 'name'] }
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

const updatePostStatus = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const { status, is_top, is_essence } = req.body;
    await post.update({
      ...(status !== undefined && { status }),
      ...(is_top !== undefined && { is_top }),
      ...(is_essence !== undefined && { is_essence })
    });
    res.json(ApiResponse.success(null, '帖子状态已更新'));
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

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
    const report = await Report.findByPk(req.params.id);
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

// 分类管理
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

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, sort_order } = req.body;
    const existing = await TiebaCategory.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json(ApiResponse.error('分类名已存在', 400));
    }
    const category = await TiebaCategory.create({ name, icon, sort_order: sort_order || 0 });
    res.status(201).json(ApiResponse.success(category, '创建成功'));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await TiebaCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json(ApiResponse.error('分类不存在', 404));
    }
    const { name, icon, sort_order } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    await category.update(updates);
    res.json(ApiResponse.success(category, '更新成功'));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await TiebaCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json(ApiResponse.error('分类不存在', 404));
    }
    await category.destroy();
    res.json(ApiResponse.success(null, '删除成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getTiebas,
  updateTiebaStatus,
  getPosts,
  updatePostStatus,
  getReports,
  handleReport,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
