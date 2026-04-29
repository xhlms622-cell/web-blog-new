const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '接收者'
  },
  type: {
    type: DataTypes.ENUM('system', 'reply', 'like', 'follow', 'mention', 'report'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target_type: {
    type: DataTypes.ENUM('post', 'comment', 'user', 'report'),
    allowNull: true,
    comment: '关联对象类型'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_read: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'is_read'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Notification;
