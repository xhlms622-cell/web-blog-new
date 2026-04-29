const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Level = sequelize.define('Level', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '等级名称'
  },
  min_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所需最低经验'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '等级图标'
  }
}, {
  tableName: 'levels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Level;
