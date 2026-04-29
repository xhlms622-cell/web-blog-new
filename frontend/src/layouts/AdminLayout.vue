<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo">
        <span>管理后台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tiebas">
          <el-icon><Menu /></el-icon>
          <span>贴吧管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/posts">
          <el-icon><Document /></el-icon>
          <span>帖子管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reports">
          <el-icon><Warning /></el-icon>
          <span>举报管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <el-button @click="$router.push('/')">返回前台</el-button>
        <div class="admin-user">
          <span>{{ authStore.user?.nickname }}</span>
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
import { useAuthStore } from '@/stores/auth'
import { DataAnalysis, User, Menu, Document, Warning } from '@element-plus/icons-vue'

const authStore = useAuthStore()
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background: #304156;

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

  .el-menu {
    border-right: none;
  }
}

.admin-header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .admin-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.admin-main {
  background: #f5f5f5;
  padding: 20px;
}
</style>
