const { Server } = require('socket.io');
const { verifyToken } = require('../utils/token');
const { ChatConversation, ChatMessage, User } = require('../models');

const onlineUsers = new Map(); // userId -> Set<socketId>

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // 认证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('未授权'));

    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Token无效'));

    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    // 加入用户 room
    socket.join(`user:${userId}`);

    // 记录在线状态
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // 发送消息
    socket.on('chat:send', async ({ conversationId, content }, callback) => {
      try {
        const conversation = await ChatConversation.findByPk(conversationId);
        if (!conversation) {
          return callback?.({ error: '会话不存在' });
        }

        // 验证当前用户是会话参与者
        if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
          return callback?.({ error: '无权访问此会话' });
        }

        const message = await ChatMessage.create({
          conversation_id: conversationId,
          sender_id: userId,
          content
        });

        // 更新会话最后消息
        await conversation.update({
          last_message: content,
          last_message_at: new Date()
        });

        const receiverId = conversation.user1_id === userId
          ? conversation.user2_id
          : conversation.user1_id;

        const payload = {
          id: message.id,
          conversation_id: conversationId,
          sender_id: userId,
          content,
          is_read: 0,
          created_at: message.created_at
        };

        // 推送给对方
        io.to(`user:${receiverId}`).emit('chat:message', payload);

        // 回调给发送者
        callback?.({ data: payload });
      } catch (error) {
        console.error('发送消息失败:', error);
        callback?.({ error: '发送失败' });
      }
    });

    // 标记已读
    socket.on('chat:read', async ({ conversationId }) => {
      try {
        await ChatMessage.update(
          { is_read: 1 },
          { where: { conversation_id: conversationId, is_read: 0 } }
        );

        // 通知对方消息已读
        const conversation = await ChatConversation.findByPk(conversationId);
        if (conversation) {
          const receiverId = conversation.user1_id === userId
            ? conversation.user2_id
            : conversation.user1_id;
          io.to(`user:${receiverId}`).emit('chat:read', { conversationId });
        }
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    });
  });

  return io;
}

module.exports = { initSocket };
