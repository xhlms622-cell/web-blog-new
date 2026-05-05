<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else-if="post">
      <div class="post-card">
        <div class="post-header">
          <div class="author-info" @click="$router.push(`/user/${post.author.id}`)">
            <el-avatar :size="44" :src="post.author.avatar">
              {{ post.author.nickname?.charAt(0) }}
            </el-avatar>
            <div class="author-meta">
              <span class="nickname">{{ post.author.nickname }}</span>
              <LevelBadge :level="post.author.level" size="small" />
            </div>
          </div>
          <div class="post-meta-right">
            <router-link :to="`/tieba/${post.tieba.id}`" class="tieba-tag">
              {{ post.tieba.name }}
            </router-link>
            <span class="time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>

        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-content">{{ post.content }}</div>

        <div v-if="post.images?.length" class="post-images">
          <el-image
            v-for="(img, i) in post.images"
            :key="i"
            :src="img"
            fit="cover"
            class="post-img"
            :preview-src-list="post.images"
            :initial-index="i"
          />
        </div>

        <div class="post-stats">
          <span>{{ post.view_count }} 浏览</span>
          <span>{{ post.comment_count }} 评论</span>
        </div>

        <div class="post-actions" v-if="authStore.isLoggedIn">
          <el-button
            :type="post.isLiked ? 'primary' : 'default'"
            @click="handleLike"
          >
            {{ post.isLiked ? '已赞' : '点赞' }} {{ post.like_count }}
          </el-button>
          <el-button
            :type="post.isFavorited ? 'warning' : 'default'"
            @click="handleFavorite"
          >
            {{ post.isFavorited ? '已收藏' : '收藏' }} {{ post.favorite_count }}
          </el-button>
          <el-button
            v-if="isOwner || authStore.isAdmin"
            type="danger"
            @click="handleDelete"
          >
            删除
          </el-button>
          <el-button
            v-if="!isOwner"
            type="info"
            @click="reportVisible = true"
          >
            举报
          </el-button>
          <el-tag v-if="post.is_essence" type="warning" size="large" class="essence-tag">精华</el-tag>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3>评论 ({{ post.comment_count }})</h3>

        <div class="comment-input" v-if="authStore.isLoggedIn">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
          />
          <el-button
            type="primary"
            :loading="commentLoading"
            @click="submitComment"
            :disabled="!commentContent.trim()"
          >
            发表评论
          </el-button>
        </div>

        <div class="comment-list">
          <div v-if="comments.length === 0" class="empty">
            <el-empty description="暂无评论" :image-size="80" />
          </div>

          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar :size="32" :src="comment.author?.avatar">
                {{ comment.author?.nickname?.charAt(0) }}
              </el-avatar>
              <div class="comment-meta">
                <span class="author-name">{{ comment.author?.nickname }}</span>
                <LevelBadge v-if="comment.author?.level" :level="comment.author.level" size="small" :show-tooltip="false" />
                <span class="floor">{{ comment.floor_number }}楼</span>
                <span class="time">{{ formatTime(comment.created_at) }}</span>
              </div>
            </div>
            <div class="comment-body">{{ comment.content }}</div>

            <!-- 回复列表 -->
            <div v-if="comment.replies?.length" class="replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <span class="reply-author">{{ reply.author?.nickname }}</span>
                <template v-if="reply.replyToUser">
                  回复 <span class="reply-to">{{ reply.replyToUser.nickname }}</span>
                </template>
                ：{{ reply.content }}
              </div>
            </div>

            <div class="comment-actions" v-if="authStore.isLoggedIn">
              <el-button text size="small" @click="startReply(comment)">回复</el-button>
            </div>
          </div>
        </div>

        <!-- 举报对话框 -->
        <el-dialog v-model="reportVisible" title="举报" width="500px">
          <el-input
            v-model="reportReason"
            type="textarea"
            :rows="3"
            placeholder="请输入举报原因..."
          />
          <template #footer>
            <el-button @click="reportVisible = false">取消</el-button>
            <el-button type="primary" :loading="reportLoading" @click="submitReport" :disabled="!reportReason.trim()">
              提交举报
            </el-button>
          </template>
        </el-dialog>

        <!-- 回复对话框 -->
        <el-dialog v-model="replyVisible" title="回复评论" width="500px">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            :placeholder="replyPlaceholder"
          />
          <template #footer>
            <el-button @click="replyVisible = false">取消</el-button>
            <el-button type="primary" :loading="replyLoading" @click="submitReply">
              回复
            </el-button>
          </template>
        </el-dialog>
      </div>
    </template>

    <el-empty v-else description="帖子不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { postApi } from '@/api/post'
import { createReport } from '@/api/report'
import { useAuthStore } from '@/stores/auth'
import LevelBadge from '@/components/LevelBadge.vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isOwner = computed(() => post.value?.author?.id === authStore.user?.id)

const reportVisible = ref(false)
const reportReason = ref('')
const reportLoading = ref(false)

const loading = ref(true)
const post = ref(null)
const comments = ref([])
const commentContent = ref('')
const commentLoading = ref(false)

const replyVisible = ref(false)
const replyContent = ref('')
const replyLoading = ref(false)
const replyTarget = ref(null)
const replyPlaceholder = ref('')

const formatTime = (time) => dayjs(time).fromNow()

const loadPost = async () => {
  loading.value = true
  try {
    const res = await postApi.getPost(route.params.id)
    post.value = res.data
    await loadComments()
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  const res = await postApi.getComments(route.params.id)
  comments.value = res.data.list
}

const handleLike = async () => {
  try {
    const res = await postApi.likePost(route.params.id)
    post.value.isLiked = res.data.isLiked
    post.value.like_count += res.data.isLiked ? 1 : -1
    ElMessage.success(res.message)
  } catch (error) {
    // handled
  }
}

const handleFavorite = async () => {
  try {
    const res = await postApi.favoritePost(route.params.id)
    post.value.isFavorited = res.data.isFavorited
    post.value.favorite_count += res.data.isFavorited ? 1 : -1
    ElMessage.success(res.message)
  } catch (error) {
    // handled
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return
  commentLoading.value = true
  try {
    await postApi.createComment(route.params.id, {
      content: commentContent.value,
      post_id: parseInt(route.params.id)
    })
    commentContent.value = ''
    post.value.comment_count++
    await loadComments()
    ElMessage.success('评论成功')
  } catch (error) {
    // handled
  } finally {
    commentLoading.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇帖子吗？此操作不可撤销。', '确认删除')
    await postApi.deletePost(route.params.id)
    ElMessage.success('帖子已删除')
    router.push('/')
  } catch {
    // cancelled
  }
}

const submitReport = async () => {
  if (!reportReason.value.trim()) return
  reportLoading.value = true
  try {
    await createReport({
      target_type: 'post',
      target_id: parseInt(route.params.id),
      reason: reportReason.value
    })
    reportVisible.value = false
    reportReason.value = ''
    ElMessage.success('举报已提交')
  } catch {
    // handled
  } finally {
    reportLoading.value = false
  }
}

const startReply = (comment) => {
  replyTarget.value = comment
  replyPlaceholder.value = `回复 ${comment.author?.nickname}...`
  replyContent.value = ''
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  replyLoading.value = true
  try {
    await postApi.createReply({
      content: replyContent.value,
      comment_id: replyTarget.value.id,
      reply_to_user_id: replyTarget.value.user_id
    })
    replyVisible.value = false
    replyContent.value = ''
    await loadComments()
    ElMessage.success('回复成功')
  } catch (error) {
    // handled
  } finally {
    replyLoading.value = false
  }
}

onMounted(() => {
  loadPost()
})

watch(() => route.params.id, (newId) => {
  if (newId) loadPost()
})
</script>

<style lang="scss" scoped>
.post-detail-page {
  .loading {
    padding: 40px;
  }

  .post-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .author-info {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;

        .author-meta {
          display: flex;
          flex-direction: column;

          .nickname {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
          }

          .level {
            font-size: 12px;
            color: #409eff;
          }
        }
      }

      .post-meta-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .tieba-tag {
          padding: 2px 10px;
          background: #ecf5ff;
          color: #409eff;
          border-radius: 4px;
          font-size: 13px;
          text-decoration: none;
        }

        .time {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .post-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }

    .post-content {
      font-size: 15px;
      color: #303133;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .post-images {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .post-img {
        width: 200px;
        height: 200px;
        border-radius: 6px;
        cursor: pointer;
      }
    }

    .post-stats {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      font-size: 13px;
      color: #909399;
      display: flex;
      gap: 16px;
    }

    .post-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      align-items: center;

      .essence-tag {
        margin-left: auto;
      }
    }
  }

  .comments-section {
    background: #fff;
    border-radius: 8px;
    padding: 24px;

    h3 {
      font-size: 16px;
      color: #303133;
      margin-bottom: 20px;
    }

    .comment-input {
      margin-bottom: 24px;

      .el-button {
        margin-top: 10px;
        float: right;
      }

      &::after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .comment-list {
      .empty {
        padding: 20px;
      }

      .comment-item {
        padding: 16px 0;
        border-bottom: 1px solid #f5f5f5;

        .comment-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;

          .comment-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;

            .author-name {
              font-weight: 500;
              color: #303133;
            }

            .floor {
              color: #909399;
            }

            .time {
              color: #c0c4cc;
            }
          }
        }

        .comment-body {
          font-size: 14px;
          color: #303133;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 42px;
        }

        .replies {
          margin-left: 42px;
          margin-bottom: 8px;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;

          .reply-item {
            font-size: 13px;
            color: #606266;
            line-height: 1.8;

            .reply-author {
              color: #409eff;
              font-weight: 500;
            }

            .reply-to {
              color: #409eff;
            }
          }
        }

        .comment-actions {
          padding-left: 42px;
        }
      }
    }
  }
}
</style>
