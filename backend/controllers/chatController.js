const { Op } = require('sequelize');
const { ChatConversation, ChatMessage, User } = require('../models');
const ApiResponse = require('../utils/response');

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await ChatConversation.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'nickname', 'avatar'] }
      ],
      order: [['last_message_at', 'DESC']]
    });

    // 计算每个会话的未读数
    const result = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await ChatMessage.count({
        where: {
          conversation_id: conv.id,
          sender_id: { [Op.ne]: userId },
          is_read: 0
        }
      });

      const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;

      return {
        id: conv.id,
        otherUser,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unreadCount
      };
    }));

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    const offset = (page - 1) * pageSize;
    const conversationId = req.params.id;

    const conversation = await ChatConversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json(ApiResponse.error('会话不存在', 404));
    }

    if (conversation.user1_id !== req.user.id && conversation.user2_id !== req.user.id) {
      return res.status(403).json(ApiResponse.error('无权访问此会话', 403));
    }

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'ASC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.json(ApiResponse.paginate(rows, parseInt(page), parseInt(pageSize), count));
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { userId: targetId } = req.body;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json(ApiResponse.error('不能给自己发私信', 400));
    }

    const target = await User.findByPk(targetId);
    if (!target) {
      return res.status(404).json(ApiResponse.error('用户不存在', 404));
    }

    // 查找或创建会话（确保 user1_id < user2_id 避免重复）
    const [minId, maxId] = currentUserId < targetId
      ? [currentUserId, targetId]
      : [targetId, currentUserId];

    const [conversation] = await ChatConversation.findOrCreate({
      where: { user1_id: minId, user2_id: maxId },
      defaults: { user1_id: minId, user2_id: maxId }
    });

    res.json(ApiResponse.success(conversation));
  } catch (error) {
    next(error);
  }
};

module.exports = { getConversations, getMessages, createConversation };
