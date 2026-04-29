<template>
  <div class="post-list">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <template v-else>
      <div v-if="posts.length === 0" class="empty">
        <el-empty description="暂无帖子" />
      </div>

      <div v-else class="posts">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="$router.push(`/post/${post.id}`)"
        >
          <div class="post-header">
            <el-avatar :size="36" :src="post.author?.avatar">
              {{ post.author?.nickname?.charAt(0) }}
            </el-avatar>
            <div class="post-meta">
              <span class="author">{{ post.author?.nickname }}</span>
              <span class="tieba">{{ post.tieba?.name }}</span>
              <span class="time">{{ formatTime(post.created_at) }}</span>
            </div>
          </div>

          <div class="post-body">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content }}</p>
          </div>

          <div class="post-footer">
            <span><el-icon><View /></el-icon> {{ post.view_count }}</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ post.comment_count }}</span>
            <span><el-icon><Star /></el-icon> {{ post.like_count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { View, ChatDotRound, Star } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const formatTime = (time) => {
  return dayjs(time).fromNow()
}
</script>

<style lang="scss" scoped>
.post-list {
  .loading {
    padding: 20px;
  }

  .empty {
    padding: 40px;
  }

  .posts {
    .post-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .post-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .post-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;

          .author {
            color: #303133;
            font-weight: 500;
          }

          .tieba {
            color: #409eff;
          }

          .time {
            color: #909399;
          }
        }
      }

      .post-body {
        .post-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .post-content {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }

      .post-footer {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
        font-size: 13px;
        color: #909399;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}
</style>
