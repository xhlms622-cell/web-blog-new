<template>
  <div class="admin-report-manage">
    <div class="page-header">
      <h2>举报管理</h2>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 140px" @change="fetchList">
        <el-option label="待处理" value="pending" />
        <el-option label="处理中" value="processing" />
        <el-option label="已解决" value="resolved" />
        <el-option label="已驳回" value="rejected" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="reports" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="举报人" width="100">
        <template #default="{ row }">
          {{ row.reporter?.nickname }}
        </template>
      </el-table-column>
      <el-table-column prop="target_type" label="举报类型" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ { post: '帖子', comment: '评论', user: '用户' }[row.target_type] || row.target_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target_id" label="对象ID" width="80" />
      <el-table-column prop="reason" label="举报原因" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="处理结果" min-width="150" show-overflow-tooltip />
      <el-table-column prop="created_at" label="举报时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending' || row.status === 'processing'">
            <el-button type="success" size="small" link @click="handleResolve(row)">解决</el-button>
            <el-button type="danger" size="small" link @click="handleReject(row)">驳回</el-button>
          </template>
          <span v-else class="text-muted">已处理</span>
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
import { getAdminReports, handleReport } from '@/api/admin'

const reports = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const filterStatus = ref('')

const statusLabel = (s) => ({
  pending: '待处理', processing: '处理中', resolved: '已解决', rejected: '已驳回'
}[s] || s)

const statusType = (s) => ({
  pending: 'warning', processing: 'info', resolved: 'success', rejected: 'danger'
}[s] || 'info')

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize }
    if (filterStatus.value) params.status = filterStatus.value

    const res = await getAdminReports(params)
    reports.value = res.data.list
    total.value = res.data.pagination.total
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

const handleResolve = async (report) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入处理结果', '处理举报', {
      inputPlaceholder: '处理结果（可选）',
      confirmButtonText: '确认解决',
      cancelButtonText: '取消'
    })
    await handleReport(report.id, { status: 'resolved', result: value || '已处理' })
    report.status = 'resolved'
    report.result = value || '已处理'
    ElMessage.success('已解决')
  } catch {
    // cancelled
  }
}

const handleReject = async (report) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回举报', {
      inputPlaceholder: '驳回原因（可选）',
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消'
    })
    await handleReport(report.id, { status: 'rejected', result: value || '举报不成立' })
    report.status = 'rejected'
    report.result = value || '举报不成立'
    ElMessage.success('已驳回')
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

.el-table {
  @include mobile { font-size: 13px; }
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
