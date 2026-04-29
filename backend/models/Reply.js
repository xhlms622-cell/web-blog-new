const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reply = sequelize.define('Reply', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  comment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reply_to_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '回复的回复ID'
  },
  reply_to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '回复的用户ID'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'replies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['comment_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = Reply;
