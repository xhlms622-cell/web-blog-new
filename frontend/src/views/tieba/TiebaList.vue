<template>
  <div class="tieba-list-page">
    <div class="page-header">
      <h1>贴吧列表</h1>
      <el-button type="primary" @click="handleCreate" v-if="authStore.isLoggedIn">
        创建贴吧
      </el-button>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="currentCategory" @change="handleFilter">
        <el-radio-button :value="0">全部</el-radio-button>
        <el-radio-button
          v-for="cat in tiebaStore.categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </el-radio-button>
      </el-radio-group>

      <el-input
        v-model="keyword"
        placeholder="搜索贴吧"
        :prefix-icon="Search"
        clearable
        style="width: 240px"
        @keyup.enter="handleFilter"
        @clear="handleFilter"
      />
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <div v-if="tiebas.length === 0" class="empty">
        <el-empty description="暂无贴吧" />
      </div>

      <div v-else class="tieba-grid">
        <div
          v-for="tieba in tiebas"
          :key="tieba.id"
          class="tieba-card"
          @click="$router.push(`/tieba/${tieba.id}`)"
        >
          <div class="tieba-cover">
            {{ tieba.name.charAt(0) }}
          </div>
          <div class="tieba-body">
            <div class="tieba-name">{{ tieba.name }}</div>
            <div class="tieba-desc">{{ tieba.description || '暂无描述' }}</div>
            <div class="tieba-stats">
              <span>{{ tieba.member_count }} 成员</span>
              <span>{{ tieba.post_count }} 帖子</span>
              <span v-if="tieba.category" class="category-tag">{{ tieba.category.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadTiebas"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { tiebaApi } from '@/api/tieba'
import { useTiebaStore } from '@/stores/tieba'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const tiebaStore = useTiebaStore()
const authStore = useAuthStore()

const loading = ref(false)
const tiebas = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const currentCategory = ref(0)
const keyword = ref('')

const loadTiebas = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (currentCategory.value) params.category_id = currentCategory.value
    if (keyword.value) params.keyword = keyword.value
    const res = await tiebaApi.getTiebas(params)
    tiebas.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  page.value = 1
  loadTiebas()
}

const handleCreate = () => {
  router.push('/tieba/create')
}

onMounted(async () => {
  await tiebaStore.fetchCategories()
  loadTiebas()
})
</script>

<style lang="scss" scoped>
.tieba-list-page {
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

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .loading, .empty {
    padding: 40px;
    text-align: center;
  }

  .tieba-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;

    .tieba-card {
      display: flex;
      gap: 16px;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .tieba-cover {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 22px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .tieba-body {
        flex: 1;
        min-width: 0;

        .tieba-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .tieba-desc {
          font-size: 13px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 8px;
        }

        .tieba-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #909399;

          .category-tag {
            color: #409eff;
          }
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
