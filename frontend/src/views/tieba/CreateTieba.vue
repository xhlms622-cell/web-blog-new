<template>
  <div class="create-tieba-page">
    <div class="form-card">
      <h1>创建贴吧</h1>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入贴吧名称（2-100个字符）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="选择分类（可选）" clearable>
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入贴吧描述（可选，不超过500字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            创建
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { tiebaApi } from '@/api/tieba'
import { useTiebaStore } from '@/stores/tieba'

const router = useRouter()
const tiebaStore = useTiebaStore()

const formRef = ref()
const loading = ref(false)
const categories = ref([])

const form = reactive({
  name: '',
  description: '',
  category_id: null
})

const rules = {
  name: [
    { required: true, message: '请输入贴吧名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度需要在2-100个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = { name: form.name }
    if (form.description) data.description = form.description
    if (form.category_id) data.category_id = form.category_id

    const res = await tiebaApi.createTieba(data)
    ElMessage.success('创建成功')
    router.push(`/tieba/${res.data.id}`)
  } catch (error) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await tiebaStore.fetchCategories()
  categories.value = tiebaStore.categories
})
</script>

<style lang="scss" scoped>
.create-tieba-page {
  display: flex;
  justify-content: center;
  padding: 40px 0;

  .form-card {
    width: 600px;
    background: #fff;
    border-radius: 8px;
    padding: 32px;

    h1 {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 24px;
    }

    .el-select {
      width: 100%;
    }
  }
}
</style>
