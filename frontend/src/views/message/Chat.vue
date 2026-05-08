<template>
  <div class="chat-page">
    <!-- 左侧会话列表 -->
    <div class="conversation-list" :class="{ 'mobile-hidden': isMobile && chatStore.currentConversation }">
      <div class="list-header">
        <h3>私信</h3>
      </div>
      <div class="list-body">
        <div
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: chatStore.currentConversation?.id === conv.id }"
          @click="selectConversation(conv)"
        >
          <el-avatar :size="40" :src="conv.otherUser?.avatar">
            {{ conv.otherUser?.nickname?.charAt(0) }}
          </el-avatar>
          <div class="conv-info">
            <div class="conv-top">
              <span class="conv-name">{{ conv.otherUser?.nickname }}</span>
              <span class="conv-time">{{ formatTime(conv.last_message_at) }}</span>
            </div>
            <div class="conv-bottom">
              <span class="conv-msg">{{ conv.last_message || '暂无消息' }}</span>
              <el-badge v-if="conv.unreadCount" :value="conv.unreadCount" :max="99" />
            </div>
          </div>
        </div>
        <el-empty v-if="!chatStore.conversations.length" description="暂无会话" />
      </div>
    </div>

    <!-- 右侧消息区域 -->
    <div class="message-area" :class="{ 'mobile-hidden': isMobile && !chatStore.currentConversation }">
      <template v-if="chatStore.currentConversation">
        <div class="message-header">
          <el-icon class="back-btn" @click="backToList"><ArrowLeft /></el-icon>
          <span>{{ chatStore.currentConversation.otherUser?.nickname }}</span>
        </div>

        <div ref="messageListRef" class="message-list" v-loading="chatStore.loading">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            class="message-item"
            :class="{ mine: msg.sender_id === authStore.user?.id }"
          >
            <el-avatar
              :size="36"
              :src="msg.sender_id === authStore.user?.id ? authStore.user?.avatar : chatStore.currentConversation.otherUser?.avatar"
            />
            <div class="message-bubble">
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.created_at) }}</div>
            </div>
          </div>
          <el-empty v-if="!chatStore.messages.length && !chatStore.loading" description="发条消息吧" :image-size="60" />
        </div>

        <div class="message-input">
          <el-input
            v-model="inputText"
            placeholder="输入消息..."
            @keyup.enter="handleSend"
            :disabled="sending"
          />
          <el-button type="primary" @click="handleSend" :disabled="!inputText.trim() || sending">
            发送
          </el-button>
        </div>
      </template>

      <div v-else class="no-conversation">
        <el-empty description="选择一个会话开始聊天" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { ArrowLeft } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const inputText = ref('')
const sending = ref(false)
const messageListRef = ref(null)
const isMobile = ref(window.innerWidth < 768)

const onResize = () => {
  isMobile.value = window.innerWidth < 768
}
window.addEventListener('resize', onResize)
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const selectConversation = async (conv) => {
  await chatStore.openConversation(conv)
  router.replace('/chat')
  scrollToBottom()
}

const backToList = () => {
  chatStore.currentConversation = null
}

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  sending.value = true
  try {
    await chatStore.sendMessage(text)
    inputText.value = ''
    scrollToBottom()
  } catch {
    // handled
  } finally {
    sending.value = false
  }
}

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  chatStore.initSocket()
  await chatStore.fetchConversations()

  const userId = route.params.userId
  if (userId) {
    await chatStore.startChat(Number(userId))
    scrollToBottom()
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.chat-page {
  display: flex;
  height: calc(100vh - 120px);
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
}

.conversation-list {
  width: 300px;
  border-right: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @include mobile {
    width: 100%;
    border-right: none;

    &.mobile-hidden { display: none; }
  }

  .list-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color-light);

    h3 {
      margin: 0;
      font-size: 16px;
    }
  }

  .list-body {
    flex: 1;
    overflow-y: auto;
  }
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-hover);
  }

  &.active {
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conv-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.conv-time {
  font-size: 12px;
  color: var(--text-placeholder);
  flex-shrink: 0;
}

.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-msg {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @include mobile {
    &.mobile-hidden { display: none; }
  }
}

.message-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color-light);
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  .back-btn {
    display: none;
    cursor: pointer;
    font-size: 20px;

    &:hover { color: var(--primary-color); }

    @include mobile { display: block; }
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  @include mobile { padding: 12px; }
}

.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;

  &.mine {
    flex-direction: row-reverse;

    .message-bubble {
      align-items: flex-end;
    }

    .message-content {
      background: var(--primary-color);
      color: #fff;
    }
  }
}

.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 60%;

  @include mobile { max-width: 75%; }
}

.message-content {
  background: var(--bg-hover);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

.message-input {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid var(--border-color-light);

  @include mobile { padding: 12px; }
}

.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
