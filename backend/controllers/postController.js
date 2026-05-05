const { Op } = require('sequelize');
const { sequelize, Post, User, Tieba, Comment, Reply, Like, Favorite, Notification } = require('../models');
const ApiResponse = require('../utils/response');
const { awardExperience } = require('../utils/level');

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
      case 'hot':
        // 热度排序：精华置顶，再按 点赞*3 + 评论*2 + 浏览*0.1 降序
        order = [
          ['is_essence', 'DESC'],
          [sequelize.literal('(Post.like_count * 3 + Post.comment_count * 2 + Post.view_count * 0.1)'), 'DESC']
        ];
        break;
      default:
        // 默认：精华置顶，再按时间降序
        order = [['is_essence', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
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

const create = async (req, res, next) => {
  try {
    const { title, content, images, tieba_id } = req.body;

    const tieba = await Tieba.findByPk(tieba_id);
    if (!tieba) {
      return res.status(404).json(ApiResponse.error('贴吧不存在', 404));
    }

    const post = await Post.create({
      title,
      content,
      images: images || null,
      user_id: req.user.id,
      tieba_id
    });

    await tieba.increment('post_count');

    // 发帖经验
    awardExperience(req.user.id, 'post', {
      targetType: 'post', targetId: post.id, description: `发帖「${title}」`
    });

    res.status(201).json(ApiResponse.success(post, '发帖成功'));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level', 'points'] },
        { model: Tieba, as: 'tieba', attributes: ['id', 'name'] }
      ]
    });

    if (!post || post.status === 0) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    await post.increment('view_count');

    let isLiked = false;
    let isFavorited = false;
    if (req.user) {
      const [like, favorite] = await Promise.all([
        Like.findOne({ where: { user_id: req.user.id, target_type: 'post', target_id: post.id } }),
        Favorite.findOne({ where: { user_id: req.user.id, post_id: post.id } })
      ]);
      isLiked = !!like;
      isFavorited = !!favorite;
    }

    res.json(ApiResponse.success({ ...post.toJSON(), isLiked, isFavorited }));
  } catch (error) {
    next(error);
  }
};

const like = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const existing = await Like.findOne({
      where: { user_id: req.user.id, target_type: 'post', target_id: post.id }
    });

    if (existing) {
      await existing.destroy();
      await post.decrement('like_count');
      res.json(ApiResponse.success({ isLiked: false }, '已取消点赞'));
    } else {
      await Like.create({
        user_id: req.user.id,
        target_type: 'post',
        target_id: post.id
      });
      await post.increment('like_count');

      if (post.user_id !== req.user.id) {
        await Notification.create({
          user_id: post.user_id,
          type: 'like',
          title: '收到点赞',
          content: `赞了你的帖子「${post.title}」`,
          target_type: 'post',
          target_id: post.id
        });

        // 帖子作者获得点赞经验
        awardExperience(post.user_id, 'like_received', {
          targetType: 'post', targetId: post.id, description: `帖子「${post.title}」收到点赞`
        });
      }

      res.json(ApiResponse.success({ isLiked: true }, '点赞成功'));
    }
  } catch (error) {
    next(error);
  }
};

const favorite = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const existing = await Favorite.findOne({
      where: { user_id: req.user.id, post_id: post.id }
    });

    if (existing) {
      await existing.destroy();
      await post.decrement('favorite_count');
      res.json(ApiResponse.success({ isFavorited: false }, '已取消收藏'));
    } else {
      await Favorite.create({
        user_id: req.user.id,
        post_id: post.id
      });
      await post.increment('favorite_count');

      // 帖子作者获得收藏经验
      if (post.user_id !== req.user.id) {
        awardExperience(post.user_id, 'favorited', {
          targetType: 'post', targetId: post.id, description: `帖子「${post.title}」被收藏`
        });
      }

      res.json(ApiResponse.success({ isFavorited: true }, '收藏成功'));
    }
  } catch (error) {
    next(error);
  }
};

const myPosts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Post.findAndCountAll({
      where: { user_id: req.user.id, status: { [Op.ne]: 0 } },
      include: [
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

const remove = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    // 只有作者或管理员可以删除
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('没有权限删除此帖子', 403));
    }

    await post.update({ status: 0 });

    // 更新贴吧帖子数
    const tieba = await Tieba.findByPk(post.tieba_id);
    if (tieba) await tieba.decrement('post_count');

    res.json(ApiResponse.success(null, '帖子已删除'));
  } catch (error) {
    next(error);
  }
};

const getHotPosts = async (req, res, next) => {
  try {
    const { period = 'day' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // 热度评分 = (点赞*3 + 评论*2 + 浏览*0.1 + 精华*100) / 时间衰减因子
    // 时间衰减：小时数越小分母越小，分数越高
    const posts = await Post.findAll({
      attributes: {
        include: [
          [sequelize.literal(`
            (Post.like_count * 3 + Post.comment_count * 2 + Post.view_count * 0.1 + Post.is_essence * 100)
            / (1 + TIMESTAMPDIFF(HOUR, Post.created_at, NOW()))
          `), 'hot_score']
        ]
      },
      where: {
        status: 1,
        created_at: { [Op.gte]: startDate }
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
        { model: Tieba, as: 'tieba', attributes: ['id', 'name'] }
      ],
      order: [[sequelize.literal('hot_score'), 'DESC']],
      limit: 10
    });

    res.json(ApiResponse.success(posts));
  } catch (error) {
    next(error);
  }
};

const myFavorites = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const user = await User.findByPk(req.user.id);
    const { count, rows } = await Post.findAndCountAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
        { model: Tieba, as: 'tieba', attributes: ['id', 'name'] },
        { model: User, as: 'favoritePosts', where: { id: req.user.id }, attributes: [] }
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

module.exports = { list, create, getById, like, favorite, myPosts, myFavorites, remove, getHotPosts };
