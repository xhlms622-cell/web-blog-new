const sequelize = require('../config/database');

// 导入模型
const User = require('./User');
const TiebaCategory = require('./TiebaCategory');
const Tieba = require('./Tieba');
const TiebaFollow = require('./TiebaFollow');
const UserFollow = require('./UserFollow');
const Post = require('./Post');
const Comment = require('./Comment');
const Reply = require('./Reply');
const Like = require('./Like');
const Favorite = require('./Favorite');
const Notification = require('./Notification');
const ChatConversation = require('./ChatConversation');
const ChatMessage = require('./ChatMessage');
const Report = require('./Report');
const PointLog = require('./PointLog');
const Level = require('./Level');

// 建立模型关联
// 用户关联
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Tieba, { foreignKey: 'owner_id', as: 'ownedTiebas' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// 用户关注
User.belongsToMany(User, {
  through: UserFollow,
  as: 'followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id'
});
User.belongsToMany(User, {
  through: UserFollow,
  as: 'followings',
  foreignKey: 'follower_id',
  otherKey: 'following_id'
});

// 贴吧关联
TiebaCategory.hasMany(Tieba, { foreignKey: 'category_id', as: 'tiebas' });
Tieba.belongsTo(TiebaCategory, { foreignKey: 'category_id', as: 'category' });
Tieba.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Tieba.hasMany(Post, { foreignKey: 'tieba_id', as: 'posts' });

// 用户关注贴吧
User.belongsToMany(Tieba, {
  through: TiebaFollow,
  as: 'followedTiebas',
  foreignKey: 'user_id',
  otherKey: 'tieba_id'
});
Tieba.belongsToMany(User, {
  through: TiebaFollow,
  as: 'followers',
  foreignKey: 'tieba_id',
  otherKey: 'user_id'
});

// 帖子关联
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.belongsTo(Tieba, { foreignKey: 'tieba_id', as: 'tieba' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

// 评论关联
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.hasMany(Reply, { foreignKey: 'comment_id', as: 'replies' });

// 回复关联
Reply.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });
Reply.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// 点赞关联
User.belongsToMany(Post, {
  through: { model: Like, scope: { target_type: 'post' } },
  as: 'likedPosts',
  foreignKey: 'user_id',
  otherKey: 'target_id'
});

// 收藏关联
User.belongsToMany(Post, {
  through: Favorite,
  as: 'favoritePosts',
  foreignKey: 'user_id',
  otherKey: 'post_id'
});

// 私信关联
ChatConversation.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
ChatConversation.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });
ChatConversation.hasMany(ChatMessage, { foreignKey: 'conversation_id', as: 'messages' });
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversation_id', as: 'conversation' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// 举报关联
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

// 积分关联
PointLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  TiebaCategory,
  Tieba,
  TiebaFollow,
  UserFollow,
  Post,
  Comment,
  Reply,
  Like,
  Favorite,
  Notification,
  ChatConversation,
  ChatMessage,
  Report,
  PointLog,
  Level
};
