<template>
  <div class="admin-user-manage">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索昵称或邮箱"
        clearable
        style="width: 240px"
        @clear="fetchList"
        @keyup.enter="fetchList"
      />
      <el-select v-model="filterRole" placeholder="角色" clearable style="width: 120px" @change="fetchList">
        <el-option label="普通用户" value="user" />
        <el-option label="吧主" value="bar_owner" />
        <el-option label="管理员" value="admin" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="fetchList">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" :src="row.avatar">{{ row.nickname?.charAt(0) }}</el-avatar>
            <div>
              <div class="user-name">{{ row.nickname }}</div>
              <div class="user-email">{{ row.email }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="roleTagType(row.role)">{{ roleLabel(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="80" />
      <el-table-column prop="created_at" label="注册时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.role !== 'admin'">
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-dropdown @command="(role) => changeRole(row, role)">
              <el-button type="primary" size="small" link>角色</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="user" :disabled="row.role === 'user'">普通用户</el-dropdown-item>
                  <el-dropdown-item command="bar_owner" :disabled="row.role === 'bar_owner'">吧主</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUsers, updateUserStatus, updateUserRole } from '@/api/admin'

const users = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const keyword = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const roleLabel = (role) => ({ user: '用户', bar_owner: '吧主', admin: '管理员' }[role] || role)
const roleTagType = (role) => ({ user: 'info', bar_owner: 'warning', admin: 'danger' }[role] || 'info')

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize }
    if (keyword.value) params.keyword = keyword.value
    if (filterRole.value) params.role = filterRole.value
    if (filterStatus.value !== '') params.status = filterStatus.value

    const res = await getAdminUsers(params)
    users.value = res.data.list
    total.value = res.data.pagination.total
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(`确定要${action}用户「${user.nickname}」吗？`, '确认操作')
    await updateUserStatus(user.id, newStatus)
    user.status = newStatus
    ElMessage.success(`已${action}`)
  } catch {
    // cancelled
  }
}

const changeRole = async (user, role) => {
  try {
    await updateUserRole(user.id, role)
    user.role = role
    ElMessage.success('角色已更新')
  } catch {
    // handled
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 16px;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.text-muted {
  color: #c0c4cc;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
