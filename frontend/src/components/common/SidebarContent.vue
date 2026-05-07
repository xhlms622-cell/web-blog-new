<template>
  <div class="sidebar-content">
    <el-menu
      :default-active="$route.path"
      router
      class="aside-menu"
      @select="$emit('navigate')"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/tiebas">
        <el-icon><Menu /></el-icon>
        <span>贴吧列表</span>
      </el-menu-item>
      <el-menu-item index="/post/create">
        <el-icon><Edit /></el-icon>
        <span>发表帖子</span>
      </el-menu-item>
      <el-menu-item index="/tieba/create">
        <el-icon><Plus /></el-icon>
        <span>创建贴吧</span>
      </el-menu-item>
    </el-menu>

    <div class="aside-section" v-if="myTiebas.length">
      <h4 class="section-title">我关注的贴吧</h4>
      <div class="tieba-list">
        <div
          v-for="tieba in myTiebas"
          :key="tieba.id"
          class="tieba-item"
          @click="$router.push(`/tieba/${tieba.id}`); $emit('navigate')"
        >
          {{ tieba.name }}
        </div>
      </div>
    </div>

    <div class="aside-section">
      <h4 class="section-title">
        <span :class="{ active: hotTab === 'day' }" @click="$emit('switchHotTab', 'day')">今日热点</span>
        <span class="divider">|</span>
        <span :class="{ active: hotTab === 'week' }" @click="$emit('switchHotTab', 'week')">本周热点</span>
      </h4>
      <div class="hot-list">
        <div
          v-for="(post, index) in hotPosts"
          :key="post.id"
          class="hot-item"
          @click="$router.push(`/post/${post.id}`); $emit('navigate')"
        >
          <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
          <span class="hot-title">{{ post.title }}</span>
        </div>
        <div v-if="!hotPosts.length" class="empty-text">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled, Menu, Edit, Plus } from '@element-plus/icons-vue'

defineProps({
  myTiebas: { type: Array, default: () => [] },
  hotPosts: { type: Array, default: () => [] },
  hotTab: { type: String, default: 'day' }
})

defineEmits(['navigate', 'switchHotTab'])
</script>

<style lang="scss" scoped>
.sidebar-content {
  .aside-menu {
    border-right: none;
  }

  .aside-section {
    padding: 16px;
    border-top: 1px solid #eee;

    .section-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;

      span {
        cursor: pointer;
        color: #909399;

        &.active {
          color: #303133;
          font-weight: 500;
        }
      }

      .divider {
        margin: 0 8px;
        cursor: default;
      }
    }

    .tieba-list {
      .tieba-item {
        padding: 8px 0;
        font-size: 14px;
        color: #606266;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }

    .hot-list {
      .hot-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 0;
        font-size: 13px;
        color: #606266;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }

        .hot-rank {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 3px;
          background: #f0f0f0;
          color: #909399;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.top {
            background: #409eff;
            color: #fff;
          }
        }

        .hot-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .empty-text {
        font-size: 13px;
        color: #c0c4cc;
        padding: 8px 0;
      }
    }
  }
}
</style>
