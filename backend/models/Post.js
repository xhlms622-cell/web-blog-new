const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片URL数组'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tieba_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_top: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否置顶'
  },
  is_essence: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否精华'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0:删除 1:正常 2:隐藏'
  }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['tieba_id'] },
    { fields: ['created_at'] },
    { fields: ['status', 'is_top'] }
  ]
});

module.exports = Post;
