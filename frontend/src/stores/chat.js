import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getConversations, getMessages, createConversation } from '@/api/chat'
import { connectSocket, getSocket } from '@/utils/socket'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([])
  const currentConversation = ref(null)
  const messages = ref([])
  const loading = ref(false)

  const totalUnread = computed(() =>
    conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  )

  const fetchConversations = async () => {
    try {
      const res = await getConversations()
      conversations.value = res.data
    } catch {
      // handled by interceptor
    }
  }

  const openConversation = async (conversation) => {
    currentConversation.value = conversation
    messages.value = []

    loading.value = true
    try {
      const res = await getMessages(conversation.id, { pageSize: 100 })
      messages.value = res.data.list

      // 标记已读
      const socket = getSocket()
      if (socket) {
        socket.emit('chat:read', { conversationId: conversation.id })
      }

      // 清除本地未读数
      const conv = conversations.value.find(c => c.id === conversation.id)
      if (conv) conv.unreadCount = 0
    } catch {
      // handled by interceptor
    } finally {
      loading.value = false
    }
  }

  const startChat = async (userId) => {
    const res = await createConversation(userId)
    const conv = res.data

    await fetchConversations()
    const target = conversations.value.find(c => c.id === conv.id)
    if (target) {
      await openConversation(target)
    }
    return target
  }

  const sendMessage = (content) => {
    return new Promise((resolve, reject) => {
      const socket = getSocket()
      if (!socket || !currentConversation.value) {
        return reject(new Error('未连接'))
      }

      socket.emit('chat:send', {
        conversationId: currentConversation.value.id,
        content
      }, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          messages.value.push(response.data)
          // 更新会话列表
          const conv = conversations.value.find(c => c.id === currentConversation.value.id)
          if (conv) {
            conv.last_message = content
            conv.last_message_at = new Date().toISOString()
          }
          resolve(response.data)
        }
      })
    })
  }

  const initSocket = () => {
    const socket = connectSocket()
    if (!socket) return

    socket.off('chat:message')
    socket.off('chat:read')

    socket.on('chat:message', (message) => {
      // 如果是当前会话的消息，直接追加
      if (currentConversation.value && message.conversation_id === currentConversation.value.id) {
        messages.value.push(message)
        // 标记已读
        socket.emit('chat:read', { conversationId: message.conversation_id })
      } else {
        // 更新未读数
        const conv = conversations.value.find(c => c.id === message.conversation_id)
        if (conv) conv.unreadCount++
      }

      // 更新会话列表排序
      const conv = conversations.value.find(c => c.id === message.conversation_id)
      if (conv) {
        conv.last_message = message.content
        conv.last_message_at = message.created_at
        conversations.value.sort((a, b) =>
          new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0)
        )
      }
    })

    socket.on('chat:read', ({ conversationId }) => {
      messages.value.forEach(m => {
        if (m.conversation_id === conversationId) {
          m.is_read = 1
        }
      })
    })
  }

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    totalUnread,
    fetchConversations,
    openConversation,
    startChat,
    sendMessage,
    initSocket
  }
})
