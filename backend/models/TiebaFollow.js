const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TiebaFollow = sequelize.define('TiebaFollow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tieba_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tieba_follows',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'tieba_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['tieba_id'] }
  ]
});

module.exports = TiebaFollow;
