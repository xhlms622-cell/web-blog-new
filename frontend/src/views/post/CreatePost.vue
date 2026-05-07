<template>
  <div class="create-post-page">
    <div class="form-card">
      <h1>发表帖子</h1>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="60px">
        <el-form-item label="贴吧" prop="tieba_id">
          <el-select v-model="form.tieba_id" placeholder="选择贴吧" filterable>
            <el-option
              v-for="t in myTiebas"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入标题（2-200个字符）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入帖子内容"
          />
        </el-form-item>

        <el-form-item label="图片">
          <div class="image-upload">
            <div v-for="(img, index) in uploadedImages" :key="index" class="preview-item">
              <el-image :src="img.url" fit="cover" class="preview-img" />
              <el-icon class="remove-btn" @click="removeImage(index)"><CircleClose /></el-icon>
            </div>
            <el-upload
              v-if="uploadedImages.length < 9"
              class="upload-trigger"
              :show-file-list="false"
              :http-request="handleUpload"
              accept="image/*"
            >
              <div class="upload-placeholder">
                <el-icon v-if="!uploading"><Plus /></el-icon>
                <el-icon v-else class="is-loading"><Loading /></el-icon>
                <span>{{ uploading ? '上传中...' : '添加图片' }}</span>
              </div>
            </el-upload>
          </div>
          <div class="upload-tip">最多上传 9 张图片，每张不超过 5MB</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            发布
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, CircleClose, Loading } from '@element-plus/icons-vue'
import { postApi } from '@/api/post'
import { tiebaApi } from '@/api/tieba'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const formRef = ref()
const loading = ref(false)
const uploading = ref(false)
const myTiebas = ref([])
const uploadedImages = ref([])

const form = reactive({
  tieba_id: null,
  title: '',
  content: ''
})

const rules = {
  tieba_id: [{ required: true, message: '请选择贴吧', trigger: 'change' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度需要在2-200个字符之间', trigger: 'blur' }
  ],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const handleUpload = async (options) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    uploadedImages.value.push({ url: res.data.url })
  } catch (error) {
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = { ...form }
    if (uploadedImages.value.length > 0) {
      data.images = uploadedImages.value.map(img => img.url)
    }
    const res = await postApi.createPost(data)
    ElMessage.success('发布成功')
    router.push(`/post/${res.data.id}`)
  } catch (error) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const tiebaId = route.params.tiebaId
  if (tiebaId) {
    form.tieba_id = parseInt(tiebaId)
  }

  const res = await tiebaApi.getTiebas({ pageSize: 100 })
  myTiebas.value = res.data.list
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.create-post-page {
  display: flex;
  justify-content: center;
  padding: 20px 0;

  .form-card {
    width: 800px;
    max-width: 100%;
    background: #fff;
    border-radius: 8px;
    padding: 32px;

    @include mobile { padding: 20px 16px; }

    h1 {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 24px;
    }

    .el-select {
      width: 100%;
    }

    .image-upload {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .preview-item {
        position: relative;
        width: 100px;
        height: 100px;

        @include mobile { width: 70px; height: 70px; }

        .preview-img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
        }

        .remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          font-size: 20px;
          color: #f56c6c;
          cursor: pointer;
          background: #fff;
          border-radius: 50%;
        }
      }

      .upload-trigger {
        .upload-placeholder {
          width: 100px;
          height: 100px;
          border: 1px dashed #d9d9d9;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #909399;
          font-size: 12px;
          cursor: pointer;
          transition: border-color 0.3s;

          @include mobile { width: 70px; height: 70px; }

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }

          .el-icon {
            font-size: 24px;
            margin-bottom: 4px;
          }
        }
      }
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 6px;
    }
  }
}
</style>
