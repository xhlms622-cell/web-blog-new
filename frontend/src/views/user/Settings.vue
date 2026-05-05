<template>
  <div class="settings-page">
    <h1>个人设置</h1>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本资料" name="profile">
        <el-form ref="profileRef" :model="profileForm" :rules="profileRules" label-width="80px" style="max-width: 500px">
          <el-form-item label="头像">
            <div class="avatar-upload">
              <el-avatar :size="80" :src="profileForm.avatar">
                {{ authStore.user?.nickname?.charAt(0) }}
              </el-avatar>
              <el-upload
                :show-file-list="false"
                :http-request="handleAvatarUpload"
                accept="image/*"
              >
                <el-button size="small" style="margin-left: 16px">更换头像</el-button>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="签名">
            <el-input v-model="profileForm.signature" type="textarea" :rows="3" maxlength="255" show-word-limit placeholder="介绍一下自己" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.gender">
              <el-radio :value="0">保密</el-radio>
              <el-radio :value="1">男</el-radio>
              <el-radio :value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="生日">
            <el-date-picker v-model="profileForm.birthday" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSaveProfile">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <el-form ref="pwdRef" :model="pwdForm" :rules="pwdRules" label-width="80px" style="max-width: 500px">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model="pwdForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="pwdForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="changingPwd" @click="handleChangePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user'
import request from '@/utils/request'

const authStore = useAuthStore()

const activeTab = ref('profile')
const saving = ref(false)
const changingPwd = ref(false)
const profileRef = ref()
const pwdRef = ref()

const profileForm = reactive({
  nickname: '',
  signature: '',
  gender: 0,
  birthday: '',
  avatar: ''
})

const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度2-20个字符', trigger: 'blur' }
  ]
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const handleAvatarUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    const res = await request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    profileForm.avatar = res.data.url
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

const handleSaveProfile = async () => {
  const valid = await profileRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const res = await userApi.updateProfile(profileForm)
    authStore.user = res.data
    ElMessage.success('保存成功')
  } catch (error) { /* handled */ }
  finally { saving.value = false }
}

const handleChangePassword = async () => {
  const valid = await pwdRef.value.validate().catch(() => false)
  if (!valid) return

  changingPwd.value = true
  try {
    await userApi.changePassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword
    })
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdRef.value.resetFields()
    ElMessage.success('密码修改成功')
  } catch (error) { /* handled */ }
  finally { changingPwd.value = false }
}

onMounted(() => {
  if (authStore.user) {
    profileForm.nickname = authStore.user.nickname || ''
    profileForm.signature = authStore.user.signature || ''
    profileForm.gender = authStore.user.gender ?? 0
    profileForm.birthday = authStore.user.birthday || ''
    profileForm.avatar = authStore.user.avatar || ''
  }
})
</script>

<style lang="scss" scoped>
.settings-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  h1 {
    font-size: 22px;
    color: #303133;
    margin-bottom: 24px;
  }

  .avatar-upload {
    display: flex;
    align-items: center;
  }
}
</style>
