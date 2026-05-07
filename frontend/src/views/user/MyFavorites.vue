<template>
  <div class="my-favorites-page">
    <h1>我的收藏</h1>
    <div v-if="loading" class="loading"><el-skeleton :rows="5" animated /></div>
    <template v-else>
      <PostList :posts="posts" />
      <div v-if="posts.length === 0" class="empty">
        <el-empty description="还没有收藏帖子" />
      </div>
      <div class="pagination" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadPosts" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postApi } from '@/api/post'
import PostList from '@/components/post/PostList.vue'

const loading = ref(false)
const posts = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await postApi.getMyFavorites({ page: page.value, pageSize })
    posts.value = res.data.list
    total.value = res.data.pagination.total
  } finally { loading.value = false }
}

onMounted(() => loadPosts())
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.my-favorites-page {
  h1 { font-size: 22px; color: #303133; margin-bottom: 20px; @include mobile { font-size: 18px; } }
  .loading, .empty { padding: 20px; }
  .pagination { margin-top: 20px; display: flex; justify-content: center; }
}
</style>
