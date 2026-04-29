const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tieba = sequelize.define('Tieba', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  cover: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '吧主ID'
  },
  member_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  post_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0:关闭 1:正常'
  }
}, {
  tableName: 'tiebas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['category_id'] },
    { fields: ['member_count'] }
  ]
});

module.exports = Tieba;
