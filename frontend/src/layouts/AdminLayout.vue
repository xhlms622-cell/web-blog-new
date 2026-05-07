<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo">
        <span>管理后台</span>
      </div>
      <AdminMenu @select="sidebarVisible = false" />
    </el-aside>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="sidebarVisible"
      direction="ltr"
      size="240px"
      :show-close="false"
      class="admin-drawer"
    >
      <template #header>
        <span class="drawer-title">管理后台</span>
      </template>
      <AdminMenu theme="light" @select="sidebarVisible = false" />
    </el-drawer>

    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon class="hamburger" @click="sidebarVisible = true"><Menu /></el-icon>
          <el-button @click="$router.push('/')">返回前台</el-button>
        </div>
        <div class="admin-user">
          <span class="admin-nickname">{{ authStore.user?.nickname }}</span>
          <el-button type="danger" size="small" @click="authStore.logout()">退出</el-button>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Menu } from '@element-plus/icons-vue'
import AdminMenu from './components/AdminMenu.vue'

const authStore = useAuthStore()
const sidebarVisible = ref(false)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background: #304156;

  @include tablet-and-below { display: none; }

  .admin-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #3a4a5d;
  }
}

.admin-drawer {
  .drawer-title {
    font-size: 18px;
    font-weight: bold;
    color: #409eff;
  }
}

.admin-header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .hamburger {
      display: none;
      font-size: 22px;
      cursor: pointer;
      color: #606266;

      &:hover { color: #409eff; }

      @include tablet-and-below { display: block; }
    }
  }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 12px;

    .admin-nickname {
      @include mobile { display: none; }
    }
  }
}

.admin-main {
  background: #f5f5f5;
  padding: 20px;

  @include mobile { padding: 12px; }
}
</style>
