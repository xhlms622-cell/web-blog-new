const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_type: {
    type: DataTypes.ENUM('post', 'comment', 'reply'),
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'target_type', 'target_id'], unique: true },
    { fields: ['target_type', 'target_id'] }
  ]
});

module.exports = Like;
