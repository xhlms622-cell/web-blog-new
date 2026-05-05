const { Comment, Reply, Post, User, Notification } = require('../models');
const ApiResponse = require('../utils/response');
const { awardExperience } = require('../utils/level');

const listByPost = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const postId = req.params.postId;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const { count, rows } = await Comment.findAndCountAll({
      where: { post_id: postId, status: 1 },
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
        {
          model: Reply, as: 'replies',
          where: { status: 1 },
          required: false,
          limit: 3,
          include: [
            { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] },
            { model: User, as: 'replyToUser', attributes: ['id', 'nickname'], foreignKey: 'reply_to_user_id' }
          ]
        }
      ],
      order: [['floor_number', 'ASC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content, post_id } = req.body;

    const post = await Post.findByPk(post_id);
    if (!post || post.status === 0) {
      return res.status(404).json(ApiResponse.error('帖子不存在', 404));
    }

    const floorNumber = post.comment_count + 1;

    const comment = await Comment.create({
      content,
      post_id,
      user_id: req.user.id,
      floor_number: floorNumber
    });

    await post.increment('comment_count');

    if (post.user_id !== req.user.id) {
      await Notification.create({
        user_id: post.user_id,
        type: 'reply',
        title: '收到评论',
        content: `评论了你的帖子「${post.title}」`,
        target_type: 'post',
        target_id: post.id
      });
    }

    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] }
      ]
    });

    // 评论经验
    awardExperience(req.user.id, 'comment', {
      targetType: 'post', targetId: post.id, description: `评论帖子「${post.title}」`
    });

    res.status(201).json(ApiResponse.success(fullComment, '评论成功'));
  } catch (error) {
    next(error);
  }
};

const createReply = async (req, res, next) => {
  try {
    const { content, comment_id, reply_to_id, reply_to_user_id } = req.body;

    const comment = await Comment.findByPk(comment_id);
    if (!comment) {
      return res.status(404).json(ApiResponse.error('评论不存在', 404));
    }

    const reply = await Reply.create({
      content,
      comment_id,
      user_id: req.user.id,
      reply_to_id: reply_to_id || null,
      reply_to_user_id: reply_to_user_id || null
    });

    if (comment.user_id !== req.user.id) {
      await Notification.create({
        user_id: comment.user_id,
        type: 'reply',
        title: '收到回复',
        content: `回复了你的评论`,
        target_type: 'post',
        target_id: comment.post_id
      });
    }

    const fullReply = await Reply.findByPk(reply.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'replyToUser', attributes: ['id', 'nickname'], foreignKey: 'reply_to_user_id' }
      ]
    });

    res.status(201).json(ApiResponse.success(fullReply, '回复成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = { listByPost, createComment, createReply };
