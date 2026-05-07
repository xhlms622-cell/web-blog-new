<template>
  <div class="admin-tieba-manage">
    <div class="page-header">
      <h2>贴吧管理</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索贴吧名称"
        clearable
        style="width: 240px"
        @clear="fetchList"
        @keyup.enter="fetchList"
      />
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="fetchList">
        <el-option label="正常" :value="1" />
        <el-option label="已关闭" :value="0" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="tiebas" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="贴吧名称" min-width="150" />
      <el-table-column label="吧主" width="120">
        <template #default="{ row }">
          {{ row.owner?.nickname || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="member_count" label="关注数" width="80" />
      <el-table-column prop="post_count" label="帖子数" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            :type="row.status === 1 ? 'danger' : 'success'"
            size="small"
            link
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '关闭' : '开启' }}
          </el-button>
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
import { getAdminTiebas, updateTiebaStatus } from '@/api/admin'

const tiebas = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const keyword = ref('')
const filterStatus = ref('')

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize }
    if (keyword.value) params.keyword = keyword.value
    if (filterStatus.value !== '') params.status = filterStatus.value

    const res = await getAdminTiebas(params)
    tiebas.value = res.data.list
    total.value = res.data.pagination.total
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (tieba) => {
  const newStatus = tieba.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '关闭' : '开启'

  try {
    await ElMessageBox.confirm(`确定要${action}贴吧「${tieba.name}」吗？`, '确认操作')
    await updateTiebaStatus(tieba.id, newStatus)
    tieba.status = newStatus
    ElMessage.success(`已${action}`)
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

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
  flex-wrap: wrap;

  @include mobile {
    .el-input, .el-select { width: 100% !important; }
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
