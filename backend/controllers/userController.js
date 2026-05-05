const { User, UserFollow, Post, Tieba, Notification } = require('../models');
const ApiResponse = require('../utils/response');
const { hashPassword, comparePassword } = require('../utils/password');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || user.status === 0) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    const [followersCount, followingCount, postsCount] = await Promise.all([
      UserFollow.count({ where: { following_id: user.id } }),
      UserFollow.count({ where: { follower_id: user.id } }),
      Post.count({ where: { user_id: user.id, status: 1 } })
    ]);

    let isFollowed = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await UserFollow.findOne({
        where: { follower_id: req.user.id, following_id: user.id }
      });
      isFollowed = !!follow;
    }

    res.json(ApiResponse.success({
      ...user.toJSON(),
      followersCount,
      followingCount,
      postsCount,
      isFollowed
    }));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { nickname, signature, gender, birthday, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    const updates = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (signature !== undefined) updates.signature = signature;
    if (gender !== undefined) updates.gender = gender;
    if (birthday !== undefined) updates.birthday = birthday;
    if (avatar !== undefined) updates.avatar = avatar;

    await user.update(updates);

    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(ApiResponse.success(updated, '更新成功'));
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json(ApiResponse.error('原密码错误', 400));
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json(ApiResponse.success(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};

const follow = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json(ApiResponse.error('不能关注自己', 400));
    }

    const target = await User.findByPk(targetId);
    if (!target) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    const existing = await UserFollow.findOne({
      where: { follower_id: req.user.id, following_id: targetId }
    });

    if (existing) {
      await existing.destroy();
      res.json(ApiResponse.success({ isFollowed: false }, '已取消关注'));
    } else {
      await UserFollow.create({ follower_id: req.user.id, following_id: targetId });

      await Notification.create({
        user_id: targetId,
        type: 'follow',
        title: '新粉丝',
        content: `${req.user.nickname} 关注了你`,
        target_type: 'user',
        target_id: req.user.id
      });

      res.json(ApiResponse.success({ isFollowed: true }, '关注成功'));
    }
  } catch (error) {
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const userId = req.params.id;

    const { count, rows } = await UserFollow.findAndCountAll({
      where: { following_id: userId },
      include: [
        { model: User, as: 'follower', attributes: ['id', 'nickname', 'avatar', 'signature'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    const list = rows.map(r => r.follower);
    res.json(ApiResponse.paginate(list, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const userId = req.params.id;

    const { count, rows } = await UserFollow.findAndCountAll({
      where: { follower_id: userId },
      include: [
        { model: User, as: 'following', attributes: ['id', 'nickname', 'avatar', 'signature'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    const list = rows.map(r => r.following);
    res.json(ApiResponse.paginate(list, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Post.findAndCountAll({
      where: { user_id: req.params.id, status: 1 },
      include: [
        { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar', 'level'] },
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

module.exports = { getProfile, updateProfile, changePassword, follow, getUserPosts, getFollowers, getFollowing };
