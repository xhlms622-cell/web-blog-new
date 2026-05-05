<template>
  <div class="category-manage">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showDialog()">新增分类</el-button>
    </div>

    <el-table :data="categories" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" min-width="150" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="{ row }">
          <span v-if="row.icon">{{ row.icon }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="100" />
      <el-table-column prop="created_at" label="创建时间" width="170">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="showDialog(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="可选，输入 emoji 或图标名" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({ name: '', icon: '', sort_order: 0 })
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const formatDate = (d) => d ? new Date(d).toLocaleString() : ''

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getAdminCategories()
    categories.value = res.data
  } catch { /* handled */ } finally { loading.value = false }
}

const showDialog = (row) => {
  if (row) {
    editingId.value = row.id
    form.name = row.name
    form.icon = row.icon || ''
    form.sort_order = row.sort_order || 0
  } else {
    editingId.value = null
    form.name = ''
    form.icon = ''
    form.sort_order = 0
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = { name: form.name, icon: form.icon || null, sort_order: form.sort_order }
    if (editingId.value) {
      await updateCategory(editingId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createCategory(data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch { /* handled */ } finally { submitting.value = false }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '确认删除')
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch { /* cancelled */ }
}

onMounted(() => { loadCategories() })
</script>

<style lang="scss" scoped>
.category-manage {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 { margin: 0; font-size: 18px; }
  }
}
.text-muted { color: #c0c4cc; }
</style>
