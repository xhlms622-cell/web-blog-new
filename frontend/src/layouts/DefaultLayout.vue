<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-content">
        <el-icon class="hamburger" @click="sidebarVisible = true"><Menu /></el-icon>

        <div class="logo" @click="$router.push('/')">
          <span class="logo-text">南师大贴吧</span>
        </div>

        <div class="search-box" :class="{ expanded: searchExpanded }">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帖子、贴吧、用户"
            @keyup.enter="handleSearch"
            @focus="searchExpanded = true"
            @blur="handleSearchBlur"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-icon class="search-toggle" @click="toggleSearch"><Search /></el-icon>

        <ThemeToggle />

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

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="sidebarVisible"
      direction="ltr"
      size="240px"
      :show-close="false"
      class="mobile-sidebar-drawer"
    >
      <template #header>
        <span class="drawer-title">南师大贴吧</span>
      </template>
      <SidebarContent
        :my-tiebas="myTiebas"
        :hot-posts="hotPosts"
        :hot-tab="hotTab"
        @navigate="sidebarVisible = false"
        @switch-hot-tab="switchHotTab"
      />
    </el-drawer>

    <el-container class="layout-main">
      <el-aside width="200px" class="layout-aside">
        <SidebarContent
          :my-tiebas="myTiebas"
          :hot-posts="hotPosts"
          :hot-tab="hotTab"
          @switch-hot-tab="switchHotTab"
        />
      </el-aside>

      <el-main class="layout-content">
        <router-view />
      </el-main>
    </el-container>

    <el-footer class="layout-footer">
      <p>© {{ new Date().getFullYear() }} 南师大贴吧 - 南师大学生交流社区</p>
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
import SidebarContent from '@/components/common/SidebarContent.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  Search, Bell, ChatDotRound, User, Document, Star,
  Setting, SwitchButton, Menu
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

const searchKeyword = ref('')
const myTiebas = ref([])
const hotPosts = ref([])
const hotTab = ref('day')
const sidebarVisible = ref(false)
const searchExpanded = ref(false)

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    searchExpanded.value = false
  }
}

const toggleSearch = () => {
  searchExpanded.value = !searchExpanded.value
}

const handleSearchBlur = () => {
  if (!searchKeyword.value.trim()) {
    searchExpanded.value = false
  }
}

const switchHotTab = (tab) => {
  hotTab.value = tab
  fetchHotPosts()
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
@import '@/assets/styles/main.scss';

.layout-container {
  min-height: 100vh;
}

.layout-header {
  background: var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .hamburger {
    display: none;
    font-size: 22px;
    cursor: pointer;
    color: var(--text-regular);
    flex-shrink: 0;

    &:hover { color: var(--primary-color); }

    @include tablet-and-below { display: block; }
  }

  .logo {
    cursor: pointer;
    flex-shrink: 0;

    .logo-text {
      font-size: 20px;
      font-weight: bold;
      color: var(--primary-color);
    }
  }

  .search-box {
    flex: 1;
    max-width: 400px;

    @include mobile {
      display: none;
      &.expanded {
        display: block;
        position: absolute;
        left: 12px;
        right: 12px;
        top: 60px;
        z-index: 99;
        max-width: none;
        padding: 8px 0;
        background: var(--bg-card);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 0 0 8px 8px;
      }
    }
  }

  .search-toggle {
    display: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-regular);
    flex-shrink: 0;

    &:hover { color: var(--primary-color); }

    @include mobile { display: block; }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;

    .nav-badge {
      cursor: pointer;

      .nav-icon {
        font-size: 20px;
        color: var(--text-regular);

        &:hover {
          color: var(--primary-color);
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
        color: var(--text-primary);

        @include mobile { display: none; }
      }
    }
  }
}

.mobile-sidebar-drawer {
  .drawer-title {
    font-size: 18px;
    font-weight: bold;
    color: var(--primary-color);
  }
}

.layout-main {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.layout-aside {
  background: var(--bg-card);
  margin-top: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 80px;
  transition: background-color 0.3s;

  @include tablet-and-below { display: none; }
}

.layout-content {
  padding: 20px;
  min-height: calc(100vh - 120px);

  @include mobile { padding: 12px; }
}

.layout-footer {
  background: var(--bg-card);
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: background-color 0.3s;
}
</style>
