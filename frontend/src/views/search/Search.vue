<template>
  <div class="search-page">
    <div class="search-header">
      <el-input
        v-model="keyword"
        placeholder="搜索帖子、贴吧、用户"
        size="large"
        :prefix-icon="Search"
        clearable
        @keyup.enter="doSearch"
      >
        <template #append>
          <el-button @click="doSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-tabs v-model="activeTab" @tab-change="doSearch">
      <el-tab-pane label="综合" name="all" />
      <el-tab-pane label="帖子" name="post" />
      <el-tab-pane label="贴吧" name="tieba" />
      <el-tab-pane label="用户" name="user" />
    </el-tabs>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- 帖子结果 -->
      <div v-if="(activeTab === 'all' || activeTab === 'post') && result.posts">
        <h3 class="section-title" v-if="activeTab === 'all'">帖子</h3>
        <PostList :posts="result.posts.list" />
        <div v-if="result.posts.list.length === 0" class="empty">暂无帖子结果</div>
      </div>

      <!-- 贴吧结果 -->
      <div v-if="(activeTab === 'all' || activeTab === 'tieba') && result.tiebas">
        <h3 class="section-title" v-if="activeTab === 'all'">贴吧</h3>
        <div class="tieba-results">
          <div
            v-for="tieba in result.tiebas"
            :key="tieba.id"
            class="tieba-item"
            @click="$router.push(`/tieba/${tieba.id}`)"
          >
            <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
            <div class="tieba-info">
              <div class="tieba-name">{{ tieba.name }}</div>
              <div class="tieba-meta">{{ tieba.member_count }} 成员 · {{ tieba.post_count }} 帖子</div>
            </div>
          </div>
          <div v-if="result.tiebas.length === 0" class="empty">暂无贴吧结果</div>
        </div>
      </div>

      <!-- 用户结果 -->
      <div v-if="(activeTab === 'all' || activeTab === 'user') && result.users">
        <h3 class="section-title" v-if="activeTab === 'all'">用户</h3>
        <div class="user-results">
          <div
            v-for="user in result.users"
            :key="user.id"
            class="user-item"
            @click="$router.push(`/user/${user.id}`)"
          >
            <el-avatar :size="40" :src="user.avatar">
              {{ user.nickname?.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">
                {{ user.nickname }}
                <LevelBadge :level="user.level" size="small" :show-tooltip="false" />
              </div>
              <div class="user-meta">{{ user.points }} 积分</div>
            </div>
          </div>
          <div v-if="result.users.length === 0" class="empty">暂无用户结果</div>
        </div>
      </div>

      <el-empty v-if="hasNoResults" description="未找到相关结果" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { searchApi } from '@/api/search'
import PostList from '@/components/post/PostList.vue'
import LevelBadge from '@/components/LevelBadge.vue'

const route = useRoute()

const keyword = ref('')
const activeTab = ref('all')
const loading = ref(false)
const result = ref({})

const hasNoResults = computed(() => {
  if (!result.value || Object.keys(result.value).length === 0) return true
  const r = result.value
  const noPosts = !r.posts || r.posts.list.length === 0
  const noTiebas = !r.tiebas || r.tiebas.length === 0
  const noUsers = !r.users || r.users.length === 0
  return noPosts && noTiebas && noUsers
})

const doSearch = async () => {
  if (!keyword.value.trim()) return
  loading.value = true
  try {
    const res = await searchApi.search({
      keyword: keyword.value,
      type: activeTab.value
    })
    result.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword
    doSearch()
  }
})

watch(() => route.query.keyword, (newKw) => {
  if (newKw && newKw !== keyword.value) {
    keyword.value = newKw
    doSearch()
  }
})
</script>

<style lang="scss" scoped>
.search-page {
  .search-header {
    margin-bottom: 20px;
    max-width: 600px;
  }

  .loading {
    padding: 20px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 16px 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .empty {
    padding: 20px;
    text-align: center;
    color: #909399;
    font-size: 14px;
  }

  .tieba-results {
    .tieba-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        flex-shrink: 0;
      }

      .tieba-info {
        .tieba-name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .tieba-meta {
          font-size: 13px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }

  .user-results {
    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .user-info {
        .user-name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .user-meta {
          font-size: 13px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }
}
</style>
