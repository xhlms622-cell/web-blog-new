<template>
  <div class="admin-post-manage">
    <div class="page-header">
      <h2>帖子管理</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索标题或内容"
        clearable
        style="width: 240px"
        @clear="fetchList"
        @keyup.enter="fetchList"
      />
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="fetchList">
        <el-option label="正常" :value="1" />
        <el-option label="已删除" :value="0" />
        <el-option label="已隐藏" :value="2" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="posts" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="作者" width="100">
        <template #default="{ row }">
          {{ row.author?.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="贴吧" width="120">
        <template #default="{ row }">
          {{ row.tieba?.name }}
        </template>
      </el-table-column>
      <el-table-column prop="view_count" label="浏览" width="70" />
      <el-table-column prop="like_count" label="点赞" width="70" />
      <el-table-column prop="comment_count" label="评论" width="70" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标记" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.is_top" type="danger" size="small" class="tag-item">置顶</el-tag>
          <el-tag v-if="row.is_essence" type="warning" size="small" class="tag-item">精华</el-tag>
          <span v-if="!row.is_top && !row.is_essence">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="发布时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
            :type="row.status === 1 ? 'danger' : 'success'"
            size="small"
            link
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '隐藏' : '恢复' }}
          </el-button>
          <el-button
            :type="row.is_top ? 'info' : 'warning'"
            size="small"
            link
            @click="toggleTop(row)"
          >
            {{ row.is_top ? '取消置顶' : '置顶' }}
          </el-button>
          <el-button
            :type="row.is_essence ? 'info' : 'warning'"
            size="small"
            link
            @click="toggleEssence(row)"
          >
            {{ row.is_essence ? '取消精华' : '精华' }}
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
import { getAdminPosts, updatePostStatus } from '@/api/admin'

const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const keyword = ref('')
const filterStatus = ref('')

const statusLabel = (s) => ({ 0: '已删除', 1: '正常', 2: '已隐藏' }[s] || '未知')
const statusType = (s) => ({ 0: 'danger', 1: 'success', 2: 'warning' }[s] || 'info')

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

    const res = await getAdminPosts(params)
    posts.value = res.data.list
    total.value = res.data.pagination.total
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (post) => {
  const newStatus = post.status === 1 ? 2 : 1
  const action = newStatus === 2 ? '隐藏' : '恢复'

  try {
    await ElMessageBox.confirm(`确定要${action}帖子「${post.title}」吗？`, '确认操作')
    await updatePostStatus(post.id, { status: newStatus })
    post.status = newStatus
    ElMessage.success(`已${action}`)
  } catch {
    // cancelled
  }
}

const toggleTop = async (post) => {
  await updatePostStatus(post.id, { is_top: post.is_top ? 0 : 1 })
  post.is_top = post.is_top ? 0 : 1
  ElMessage.success(post.is_top ? '已置顶' : '已取消置顶')
}

const toggleEssence = async (post) => {
  await updatePostStatus(post.id, { is_essence: post.is_essence ? 0 : 1 })
  post.is_essence = post.is_essence ? 0 : 1
  ElMessage.success(post.is_essence ? '已设为精华' : '已取消精华')
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

.tag-item {
  margin-right: 4px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
