const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '举报人'
  },
  target_type: {
    type: DataTypes.ENUM('post', 'comment', 'user'),
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'resolved', 'rejected'),
    defaultValue: 'pending'
  },
  handler_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '处理人'
  },
  result: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '处理结果'
  }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['target_type', 'target_id'] }
  ]
});

module.exports = Report;
