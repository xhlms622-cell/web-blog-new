<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-text">南师大贴吧</span>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帖子、贴吧、用户"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="header-right">
          <template v-if="authStore.isLoggedIn">
            <el-badge :value="notificationStore.unreadCount" :hidden="!notificationStore.unreadCount" class="nav-badge">
              <el-icon class="nav-icon" @click="$router.push('/notifications')">
                <Bell />
              </el-icon>
            </el-badge>

            <el-badge :value="chatStore.totalUnread" :hidden="!chatStore.totalUnread" class="nav-badge">
              <el-icon class="nav-icon" @click="$router.push('/chat')">
                <ChatDotRound />
              </el-icon>
            </el-badge>

            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" :src="authStore.user?.avatar">
                  {{ authStore.user?.nickname?.charAt(0) }}
                </el-avatar>
                <span class="nickname">{{ authStore.user?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push(`/user/${authStore.user?.id}`)">
                    <el-icon><User /></el-icon>个人主页
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/my/posts')">
                    <el-icon><Document /></el-icon>我的帖子
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/my/favorites')">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/settings')">
                    <el-icon><Setting /></el-icon>设置
                  </el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" @click="$router.push('/admin')">
                    <el-icon><Setting /></el-icon>管理后台
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <el-container class="layout-main">
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="$route.path"
          router
          class="aside-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/tiebas">
            <el-icon><Menu /></el-icon>
            <span>贴吧列表</span>
          </el-menu-item>
          <el-menu-item index="/post/create">
            <el-icon><Edit /></el-icon>
            <span>发表帖子</span>
          </el-menu-item>
          <el-menu-item index="/tieba/create">
            <el-icon><Plus /></el-icon>
            <span>创建贴吧</span>
          </el-menu-item>
        </el-menu>

        <div class="aside-section" v-if="myTiebas.length">
          <h4 class="section-title">我关注的贴吧</h4>
          <div class="tieba-list">
            <div
              v-for="tieba in myTiebas"
              :key="tieba.id"
              class="tieba-item"
              @click="$router.push(`/tieba/${tieba.id}`)"
            >
              {{ tieba.name }}
            </div>
          </div>
        </div>

        <div class="aside-section">
          <h4 class="section-title">
            <span :class="{ active: hotTab === 'day' }" @click="hotTab = 'day'; fetchHotPosts()">今日热点</span>
            <span class="divider">|</span>
            <span :class="{ active: hotTab === 'week' }" @click="hotTab = 'week'; fetchHotPosts()">本周热点</span>
          </h4>
          <div class="hot-list">
            <div
              v-for="(post, index) in hotPosts"
              :key="post.id"
              class="hot-item"
              @click="$router.push(`/post/${post.id}`)"
            >
              <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="hot-title">{{ post.title }}</span>
            </div>
            <div v-if="!hotPosts.length" class="empty-text">暂无数据</div>
          </div>
        </div>
      </el-aside>

      <el-main class="layout-content">
        <router-view />
      </el-main>
    </el-container>

    <el-footer class="layout-footer">
      <p>© 2024 南师大贴吧 - 南师大学生交流社区</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useChatStore } from '@/stores/chat'
import { postApi } from '@/api/post'
import {
  Search, Bell, ChatDotRound, User, Document, Star,
  Setting, SwitchButton, HomeFilled, Menu, Edit, Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

const searchKeyword = ref('')
const myTiebas = ref([])
const hotPosts = ref([])
const hotTab = ref('day')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
  }
}

const fetchHotPosts = async () => {
  try {
    const res = await postApi.getHotPosts({ period: hotTab.value })
    hotPosts.value = res.data
  } catch {
    // ignore
  }
}

const handleLogout = () => {
  authStore.logout()
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    if (!authStore.user) {
      await authStore.fetchProfile()
    }
    notificationStore.fetchUnreadCount()
    chatStore.initSocket()
    chatStore.fetchConversations()
  }
  fetchHotPosts()
})
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
}

.layout-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo {
    cursor: pointer;

    .logo-text {
      font-size: 20px;
      font-weight: bold;
      color: #409eff;
    }
  }

  .search-box {
    flex: 1;
    max-width: 400px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .nav-badge {
      cursor: pointer;

      .nav-icon {
        font-size: 20px;
        color: #606266;

        &:hover {
          color: #409eff;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .nickname {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.layout-main {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.layout-aside {
  background: #fff;
  margin-top: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 80px;

  .aside-menu {
    border-right: none;
  }

  .aside-section {
    padding: 16px;
    border-top: 1px solid #eee;

    .section-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;
    }

    .tieba-list {
      .tieba-item {
        padding: 8px 0;
        font-size: 14px;
        color: #606266;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }

    .section-title {
      span {
        cursor: pointer;
        color: #909399;

        &.active {
          color: #303133;
          font-weight: 500;
        }
      }

      .divider {
        margin: 0 8px;
        cursor: default;
      }
    }

    .hot-list {
      .hot-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 0;
        font-size: 13px;
        color: #606266;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }

        .hot-rank {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 3px;
          background: #f0f0f0;
          color: #909399;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.top {
            background: #409eff;
            color: #fff;
          }
        }

        .hot-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .empty-text {
        font-size: 13px;
        color: #c0c4cc;
        padding: 8px 0;
      }
    }
  }
}

.layout-content {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.layout-footer {
  background: #fff;
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}
</style>
