const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'post_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['post_id'] }
  ]
});

module.exports = Favorite;
