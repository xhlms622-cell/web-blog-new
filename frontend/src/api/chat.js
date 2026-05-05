import request from '@/utils/request'

export const getConversations = () => {
  return request.get('/chat/conversations')
}

export const getMessages = (conversationId, params) => {
  return request.get(`/chat/conversations/${conversationId}/messages`, { params })
}

export const createConversation = (userId) => {
  return request.post('/chat/conversations', { userId })
}
