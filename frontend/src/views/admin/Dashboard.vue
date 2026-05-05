<template>
  <div class="admin-dashboard" v-loading="loading">
    <h2>数据概览</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #ecf5ff; color: #409eff">
          <el-icon :size="28"><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #f0f9eb; color: #67c23a">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalPosts }}</div>
          <div class="stat-label">总帖子数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c">
          <el-icon :size="28"><Menu /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTiebas }}</div>
          <div class="stat-label">贴吧总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fef0f0; color: #f56c6c">
          <el-icon :size="28"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pendingReports }}</div>
          <div class="stat-label">待处理举报</div>
        </div>
      </div>
    </div>

    <h2>今日数据</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value" style="color: #409eff">{{ stats.todayNewUsers }}</div>
          <div class="stat-label">新注册用户</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value" style="color: #67c23a">{{ stats.todayNewPosts }}</div>
          <div class="stat-label">新发布帖子</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Document, Menu, Warning } from '@element-plus/icons-vue'
import { getDashboard } from '@/api/admin'

const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalTiebas: 0,
  todayNewUsers: 0,
  todayNewPosts: 0,
  pendingReports: 0
})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const res = await getDashboard()
    stats.value = res.data
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style lang="scss" scoped>
.admin-dashboard {
  h2 {
    font-size: 16px;
    color: #303133;
    margin-bottom: 16px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
