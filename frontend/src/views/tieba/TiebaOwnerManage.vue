<template>
  <div class="tieba-manage-page">
    <div class="page-header">
      <h2>贴吧管理 - {{ dashboard.tiebaName || '' }}</h2>
      <el-button @click="$router.push(`/tieba/${tiebaId}`)">返回贴吧</el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 贴吧信息 -->
      <el-tab-pane label="贴吧信息" name="info">
        <el-form ref="infoFormRef" :model="infoForm" :rules="infoRules" label-width="100px" style="max-width: 500px">
          <el-form-item label="贴吧名称" prop="name">
            <el-input v-model="infoForm.name" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="infoForm.category_id" placeholder="选择分类" clearable style="width: 100%">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="infoForm.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="封面图">
            <el-input v-model="infoForm.cover" placeholder="图片URL（可选）" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="infoSaving" @click="saveTiebaInfo">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 概览 -->
      <el-tab-pane label="概览" name="dashboard">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalPosts }}</div>
            <div class="stat-label">帖子总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.totalMembers }}</div>
            <div class="stat-label">关注人数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dashboard.todayNewPosts }}</div>
            <div class="stat-label">今日新帖</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 帖子管理 -->
      <el-tab-pane label="帖子管理" name="posts">
        <div class="filter-bar">
          <el-input v-model="postKeyword" placeholder="搜索帖子" clearable style="width: 200px" @clear="loadPosts" @keyup.enter="loadPosts" />
          <el-select v-model="postStatus" placeholder="状态" clearable style="width: 120px" @change="loadPosts">
            <el-option label="正常" :value="1" />
            <el-option label="已隐藏" :value="2" />
          </el-select>
          <el-button type="primary" @click="loadPosts">搜索</el-button>
        </div>

        <el-table :data="posts" v-loading="postsLoading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column label="作者" width="100">
            <template #default="{ row }">{{ row.author?.nickname }}</template>
          </el-table-column>
          <el-table-column prop="view_count" label="浏览" width="70" />
          <el-table-column prop="like_count" label="点赞" width="70" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                {{ row.status === 1 ? '正常' : '已隐藏' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标记" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.is_top" type="danger" size="small" class="tag-item">置顶</el-tag>
              <el-tag v-if="row.is_essence" type="warning" size="small" class="tag-item">精华</el-tag>
              <span v-if="!row.is_top && !row.is_essence">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link :type="row.is_top ? 'info' : 'warning'" @click="toggleTop(row)">
                {{ row.is_top ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button size="small" link :type="row.is_essence ? 'info' : 'warning'" @click="toggleEssence(row)">
                {{ row.is_essence ? '取消精华' : '精华' }}
              </el-button>
              <el-button size="small" link :type="row.status === 1 ? 'danger' : 'success'" @click="togglePostStatus(row)">
                {{ row.status === 1 ? '隐藏' : '恢复' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="postPage" :page-size="20" :total="postTotal" layout="total, prev, pager, next" @current-change="loadPosts" />
        </div>
      </el-tab-pane>

      <!-- 成员管理 -->
      <el-tab-pane label="成员管理" name="members">
        <el-table :data="members" v-loading="membersLoading" stripe>
          <el-table-column label="用户" min-width="200">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="32" :src="row.avatar">{{ row.nickname?.charAt(0) }}</el-avatar>
                <span>{{ row.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : row.role === 'bar_owner' ? 'warning' : 'info'" size="small">
                {{ { user: '用户', bar_owner: '吧主', admin: '管理员' }[row.role] || row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="followed_at" label="关注时间" width="170">
            <template #default="{ row }">{{ formatDate(row.followed_at) }}</template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="memberPage" :page-size="20" :total="memberTotal" layout="total, prev, pager, next" @current-change="loadMembers" />
        </div>
      </el-tab-pane>

      <!-- 举报管理 -->
      <el-tab-pane label="举报管理" name="reports">
        <el-table :data="reports" v-loading="reportsLoading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column label="举报人" width="100">
            <template #default="{ row }">{{ row.reporter?.nickname }}</template>
          </el-table-column>
          <el-table-column prop="target_id" label="帖子ID" width="80" />
          <el-table-column prop="reason" label="举报原因" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="{ pending: 'warning', resolved: 'success', rejected: 'danger' }[row.status]" size="small">
                {{ { pending: '待处理', resolved: '已解决', rejected: '已驳回' }[row.status] || row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="处理结果" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'pending'">
                <el-button type="success" size="small" link @click="resolveReport(row)">解决</el-button>
                <el-button type="danger" size="small" link @click="rejectReport(row)">驳回</el-button>
              </template>
              <span v-else class="text-muted">已处理</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="reportPage" :page-size="20" :total="reportTotal" layout="total, prev, pager, next" @current-change="loadReports" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { barOwnerApi } from '@/api/barOwner'
import { tiebaApi } from '@/api/tieba'

const route = useRoute()
const tiebaId = route.params.id
const activeTab = ref('info')

const dashboard = ref({ tiebaName: '', totalPosts: 0, totalMembers: 0, todayNewPosts: 0 })

// 贴吧信息
const infoFormRef = ref()
const infoSaving = ref(false)
const categories = ref([])
const infoForm = reactive({ name: '', description: '', cover: '', category_id: null })
const infoRules = {
  name: [{ required: true, message: '请输入贴吧名称', trigger: 'blur' }]
}

// 帖子管理
const posts = ref([])
const postsLoading = ref(false)
const postPage = ref(1)
const postTotal = ref(0)
const postKeyword = ref('')
const postStatus = ref('')

// 成员管理
const members = ref([])
const membersLoading = ref(false)
const memberPage = ref(1)
const memberTotal = ref(0)

// 举报管理
const reports = ref([])
const reportsLoading = ref(false)
const reportPage = ref(1)
const reportTotal = ref(0)

const formatDate = (d) => d ? new Date(d).toLocaleString() : ''

const loadDashboard = async () => {
  try {
    const res = await barOwnerApi.getDashboard(tiebaId)
    dashboard.value = res.data
  } catch { /* handled */ }
}

const loadTiebaInfo = async () => {
  try {
    const res = await barOwnerApi.getTiebaInfo(tiebaId)
    const data = res.data
    infoForm.name = data.name
    infoForm.description = data.description || ''
    infoForm.cover = data.cover || ''
    infoForm.category_id = data.category_id || null
  } catch { /* handled */ }
}

const loadCategories = async () => {
  try {
    const res = await tiebaApi.getCategories()
    categories.value = res.data
  } catch { /* handled */ }
}

const saveTiebaInfo = async () => {
  const valid = await infoFormRef.value.validate().catch(() => false)
  if (!valid) return
  infoSaving.value = true
  try {
    await barOwnerApi.updateTiebaInfo(tiebaId, { ...infoForm })
    ElMessage.success('保存成功')
  } catch { /* handled */ } finally { infoSaving.value = false }
}

const loadPosts = async () => {
  postsLoading.value = true
  try {
    const params = { page: postPage.value, pageSize: 20 }
    if (postKeyword.value) params.keyword = postKeyword.value
    if (postStatus.value !== '') params.status = postStatus.value
    const res = await barOwnerApi.getPosts(tiebaId, params)
    posts.value = res.data.list
    postTotal.value = res.data.pagination.total
  } catch { /* handled */ } finally { postsLoading.value = false }
}

const loadMembers = async () => {
  membersLoading.value = true
  try {
    const res = await barOwnerApi.getMembers(tiebaId, { page: memberPage.value, pageSize: 20 })
    members.value = res.data.list
    memberTotal.value = res.data.pagination.total
  } catch { /* handled */ } finally { membersLoading.value = false }
}

const loadReports = async () => {
  reportsLoading.value = true
  try {
    const res = await barOwnerApi.getReports(tiebaId, { page: reportPage.value, pageSize: 20 })
    reports.value = res.data.list
    reportTotal.value = res.data.pagination.total
  } catch { /* handled */ } finally { reportsLoading.value = false }
}

const toggleTop = async (post) => {
  await barOwnerApi.updatePost(tiebaId, post.id, { is_top: post.is_top ? 0 : 1 })
  post.is_top = post.is_top ? 0 : 1
  ElMessage.success(post.is_top ? '已置顶' : '已取消置顶')
}

const toggleEssence = async (post) => {
  await barOwnerApi.updatePost(tiebaId, post.id, { is_essence: post.is_essence ? 0 : 1 })
  post.is_essence = post.is_essence ? 0 : 1
  ElMessage.success(post.is_essence ? '已设为精华' : '已取消精华')
}

const togglePostStatus = async (post) => {
  const newStatus = post.status === 1 ? 2 : 1
  const action = newStatus === 2 ? '隐藏' : '恢复'
  try {
    await ElMessageBox.confirm(`确定要${action}这篇帖子吗？`, '确认操作')
    await barOwnerApi.updatePost(tiebaId, post.id, { status: newStatus })
    post.status = newStatus
    ElMessage.success(`已${action}`)
  } catch { /* cancelled */ }
}

const resolveReport = async (report) => {
  try {
    const { value } = await ElMessageBox.prompt('处理结果', '解决举报', { inputPlaceholder: '可选', confirmButtonText: '确认' })
    await barOwnerApi.handleReport(tiebaId, report.id, { status: 'resolved', result: value || '已处理' })
    report.status = 'resolved'
    report.result = value || '已处理'
    ElMessage.success('已解决')
  } catch { /* cancelled */ }
}

const rejectReport = async (report) => {
  try {
    const { value } = await ElMessageBox.prompt('驳回原因', '驳回举报', { inputPlaceholder: '可选', confirmButtonText: '确认' })
    await barOwnerApi.handleReport(tiebaId, report.id, { status: 'rejected', result: value || '举报不成立' })
    report.status = 'rejected'
    report.result = value || '举报不成立'
    ElMessage.success('已驳回')
  } catch { /* cancelled */ }
}

const handleTabChange = (tab) => {
  if (tab === 'info') loadTiebaInfo()
  else if (tab === 'dashboard') loadDashboard()
  else if (tab === 'posts') loadPosts()
  else if (tab === 'members') loadMembers()
  else if (tab === 'reports') loadReports()
}

onMounted(() => {
  loadCategories()
  loadTiebaInfo()
})
</script>

<style lang="scss" scoped>
.tieba-manage-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 { margin: 0; font-size: 18px; }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 600px;
}

.stat-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;

  .stat-value { font-size: 28px; font-weight: 600; color: #303133; }
  .stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
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

.tag-item { margin-right: 4px; }
.text-muted { color: #c0c4cc; }

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
