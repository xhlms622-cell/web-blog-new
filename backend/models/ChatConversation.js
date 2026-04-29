const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatConversation = sequelize.define('ChatConversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  last_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'chat_conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user1_id', 'user2_id'], unique: true },
    { fields: ['user1_id'] },
    { fields: ['user2_id'] }
  ]
});

module.exports = ChatConversation;
