<template>
  <el-menu
    :default-active="$route.path"
    router
    :background-color="theme === 'dark' ? '#304156' : '#fff'"
    :text-color="theme === 'dark' ? '#bfcbd9' : '#303133'"
    active-text-color="#409eff"
    @select="$emit('select')"
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
    <el-menu-item index="/admin/categories">
      <el-icon><Folder /></el-icon>
      <span>分类管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { DataAnalysis, User, Menu, Document, Warning, Folder } from '@element-plus/icons-vue'

defineProps({
  theme: { type: String, default: 'dark' }
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.el-menu {
  border-right: none;
}
</style>
