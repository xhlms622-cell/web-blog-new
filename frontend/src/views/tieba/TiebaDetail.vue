<template>
  <div class="tieba-detail-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="tiebaStore.currentTieba">
      <div class="tieba-header">
        <div class="header-left">
          <div class="tieba-avatar">
            {{ tiebaStore.currentTieba.name.charAt(0) }}
          </div>
          <div class="tieba-info">
            <h1>{{ tiebaStore.currentTieba.name }}</h1>
            <p class="tieba-desc">{{ tiebaStore.currentTieba.description || '暂无描述' }}</p>
            <div class="tieba-meta">
              <span>{{ tiebaStore.currentTieba.member_count }} 成员</span>
              <span>{{ tiebaStore.currentTieba.post_count }} 帖子</span>
              <span v-if="tiebaStore.currentTieba.owner">
                吧主：{{ tiebaStore.currentTieba.owner.nickname }}
              </span>
              <span v-if="tiebaStore.currentTieba.category" class="category">
                {{ tiebaStore.currentTieba.category.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-button
            v-if="authStore.isLoggedIn"
            :type="tiebaStore.currentTieba.isFollowed ? 'default' : 'primary'"
            @click="handleFollow"
          >
            {{ tiebaStore.currentTieba.isFollowed ? '已关注' : '关注' }}
          </el-button>
          <el-button
            v-if="authStore.isLoggedIn"
            type="primary"
            @click="$router.push(`/post/create/${tiebaStore.currentTieba.id}`)"
          >
            发帖
          </el-button>
          <el-button
            v-if="isOwnerOrAdmin"
            type="warning"
            @click="$router.push(`/tieba/${tiebaStore.currentTieba.id}/manage`)"
          >
            管理
          </el-button>
        </div>
      </div>

      <div class="posts-section">
        <PostList :posts="tiebaStore.posts" :loading="postsLoading" />
        <div class="pagination" v-if="tiebaStore.postsPagination.total > tiebaStore.postsPagination.pageSize">
          <el-pagination
            v-model:current-page="postPage"
            :page-size="tiebaStore.postsPagination.pageSize"
            :total="tiebaStore.postsPagination.total"
            layout="prev, pager, next"
            @current-change="loadPosts"
          />
        </div>
      </div>
    </template>

    <el-empty v-else description="贴吧不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTiebaStore } from '@/stores/tieba'
import { useAuthStore } from '@/stores/auth'
import PostList from '@/components/post/PostList.vue'

const route = useRoute()
const tiebaStore = useTiebaStore()
const authStore = useAuthStore()

const loading = ref(true)
const postsLoading = ref(false)
const postPage = ref(1)

const isOwnerOrAdmin = computed(() => {
  const tieba = tiebaStore.currentTieba
  if (!tieba || !authStore.isLoggedIn) return false
  return authStore.user?.role === 'admin' || tieba.owner_id === authStore.user?.id
})

const loadPosts = async () => {
  postsLoading.value = true
  try {
    await tiebaStore.fetchPosts(route.params.id, { page: postPage.value })
  } finally {
    postsLoading.value = false
  }
}

const handleFollow = async () => {
  try {
    const data = await tiebaStore.toggleFollow(route.params.id)
    ElMessage.success(data.isFollowed ? '关注成功' : '已取消关注')
  } catch (error) {
    // error handled by interceptor
  }
}

const loadTieba = async () => {
  loading.value = true
  try {
    await tiebaStore.fetchTieba(route.params.id)
    await loadPosts()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTieba()
})

onUnmounted(() => {
  tiebaStore.clearCurrent()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    postPage.value = 1
    loadTieba()
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.tieba-detail-page {
  .loading {
    padding: 40px;
  }

  .tieba-header {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    @include mobile {
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .header-left {
      display: flex;
      gap: 20px;

      @include mobile { gap: 12px; }

      .tieba-avatar {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 32px;
        font-weight: bold;
        flex-shrink: 0;

        @include mobile { width: 60px; height: 60px; font-size: 24px; }
      }

      .tieba-info {
        min-width: 0;

        h1 {
          font-size: 22px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 6px;

          @include mobile { font-size: 18px; }
        }

        .tieba-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .tieba-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #909399;
          flex-wrap: wrap;

          .category {
            color: #409eff;
          }
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;

      @include mobile {
        width: 100%;
        .el-button { flex: 1; }
      }
    }
  }

  .posts-section {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
