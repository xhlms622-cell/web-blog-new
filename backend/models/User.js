const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: '/images/default-avatar.png'
  },
  signature: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0:保密 1:男 2:女'
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '积分'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '等级'
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '经验值'
  },
  role: {
    type: DataTypes.ENUM('user', 'bar_owner', 'admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0:禁用 1:正常'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['nickname'] },
    { fields: ['points'] }
  ]
});

module.exports = User;
