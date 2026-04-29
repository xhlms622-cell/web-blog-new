const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFollow = sequelize.define('UserFollow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关注者'
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '被关注者'
  }
}, {
  tableName: 'user_follows',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['follower_id', 'following_id'], unique: true },
    { fields: ['follower_id'] },
    { fields: ['following_id'] }
  ]
});

module.exports = UserFollow;
