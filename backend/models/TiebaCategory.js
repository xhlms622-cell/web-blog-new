const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TiebaCategory = sequelize.define('TiebaCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'tieba_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TiebaCategory;
