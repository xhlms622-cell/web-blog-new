<template>
  <div class="notification-page">
    <div class="page-header">
      <h2>消息通知</h2>
      <el-button
        v-if="notifications.length"
        type="primary"
        link
        @click="handleMarkAllRead"
      >
        全部已读
      </el-button>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="filterType" @change="handleFilterChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="reply">评论</el-radio-button>
        <el-radio-button label="like">点赞</el-radio-button>
        <el-radio-button label="follow">关注</el-radio-button>
        <el-radio-button label="system">系统</el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="notification-list">
      <template v-if="notifications.length">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.is_read }"
          @click="handleClick(item)"
        >
          <div class="notification-icon">
            <el-icon :size="20" :color="getIconColor(item.type)">
              <component :is="getIcon(item.type)" />
            </el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-text">{{ item.content }}</div>
            <div class="notification-time">{{ formatTime(item.created_at) }}</div>
          </div>
          <div v-if="!item.is_read" class="unread-dot"></div>
        </div>
      </template>
      <el-empty v-else description="暂无通知" />
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound, Star, UserFilled, Bell, Promotion
} from '@element-plus/icons-vue'
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

const notifications = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const filterType = ref('')

const iconMap = {
  reply: ChatDotRound,
  like: Star,
  follow: UserFilled,
  system: Bell,
  mention: Promotion,
  report: Bell
}

const colorMap = {
  reply: '#409eff',
  like: '#f56c6c',
  follow: '#67c23a',
  system: '#e6a23c',
  mention: '#409eff',
  report: '#f56c6c'
}

const getIcon = (type) => iconMap[type] || Bell
const getIconColor = (type) => colorMap[type] || '#909399'

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString()
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize }
    if (filterType.value) params.type = filterType.value
    const res = await getNotifications(params)
    notifications.value = res.data.list
    total.value = res.data.pagination.total
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchList()
}

const handleClick = async (item) => {
  if (!item.is_read) {
    await markAsRead(item.id)
    item.is_read = 1
    notificationStore.decrement()
  }

  if (item.target_type === 'post' && item.target_id) {
    router.push(`/post/${item.target_id}`)
  } else if (item.target_type === 'user' && item.target_id) {
    router.push(`/user/${item.target_id}`)
  }
}

const handleMarkAllRead = async () => {
  await markAllAsRead()
  notifications.value.forEach(n => { n.is_read = 1 })
  notificationStore.clearCount()
  ElMessage.success('全部已读')
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.notification-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 18px;
  }
}

.filter-bar {
  margin-bottom: 16px;
}

.notification-list {
  min-height: 200px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: #f5f7fa;
  }

  &.unread {
    background: #ecf5ff;

    &:hover {
      background: #d9ecff;
    }
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #c0c4cc;
}

.unread-dot {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
