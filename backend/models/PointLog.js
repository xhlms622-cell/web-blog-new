const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointLog = sequelize.define('PointLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '变动积分，正负数'
  },
  type: {
    type: DataTypes.ENUM('post', 'comment', 'like_received', 'daily_login', 'favorited', 'punish'),
    allowNull: false
  },
  target_type: {
    type: DataTypes.ENUM('post', 'comment'),
    allowNull: true,
    comment: '关联对象'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'point_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = PointLog;
