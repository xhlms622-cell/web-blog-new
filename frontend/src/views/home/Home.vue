<template>
  <div class="home-page">
    <div class="page-header">
      <h1>热门帖子</h1>
      <el-button type="primary" @click="$router.push('/post/create')" v-if="authStore.isLoggedIn">
        发表帖子
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="最新" name="new">
        <PostList :posts="posts" :loading="loading" />
      </el-tab-pane>
      <el-tab-pane label="精华" name="essence">
        <PostList :posts="posts" :loading="loading" />
      </el-tab-pane>
    </el-tabs>

    <div class="hot-tiebas card">
      <div class="section-header">
        <h3>热门贴吧</h3>
        <el-button text type="primary" @click="$router.push('/tiebas')">查看全部</el-button>
      </div>
      <div v-if="tiebasLoading" class="loading-mini">
        <el-skeleton :rows="2" animated />
      </div>
      <div v-else class="tieba-grid">
        <div
          v-for="tieba in hotTiebas"
          :key="tieba.id"
          class="tieba-card"
          @click="$router.push(`/tieba/${tieba.id}`)"
        >
          <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
          <div class="tieba-info">
            <div class="tieba-name">{{ tieba.name }}</div>
            <div class="tieba-count">{{ tieba.member_count }} 成员</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PostList from '@/components/post/PostList.vue'
import { postApi } from '@/api/post'
import { tiebaApi } from '@/api/tieba'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const activeTab = ref('new')
const loading = ref(false)
const tiebasLoading = ref(false)
const posts = ref([])
const hotTiebas = ref([])

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await postApi.getPosts({ sort: activeTab.value })
    posts.value = res.data.list
  } finally {
    loading.value = false
  }
}

const loadHotTiebas = async () => {
  tiebasLoading.value = true
  try {
    const res = await tiebaApi.getTiebas({ sort: 'member', pageSize: 6 })
    hotTiebas.value = res.data.list
  } finally {
    tiebasLoading.value = false
  }
}

const handleTabChange = () => {
  loadPosts()
}

onMounted(() => {
  loadPosts()
  loadHotTiebas()
})
</script>

<style lang="scss" scoped>
.home-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      color: #303133;
    }
  }

  .hot-tiebas {
    margin-top: 20px;
    background: #fff;
    border-radius: 8px;
    padding: 20px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        color: #303133;
      }
    }

    .loading-mini {
      padding: 10px;
    }

    .tieba-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .tieba-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        .tieba-avatar {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
          font-weight: bold;
        }

        .tieba-info {
          .tieba-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }

          .tieba-count {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }
}
</style>
