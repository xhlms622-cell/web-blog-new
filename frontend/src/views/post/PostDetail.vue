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
        <div class="post-content markdown-body" v-html="renderedContent"></div>

        <div v-if="post.images?.length" class="post-images">
          <el-image
            v-for="(img, i) in post.images"
            :key="i"
            :src="img"
            fit="cover"
            class="post-img"
            lazy
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
            v-if="isOwner"
            @click="openEdit"
          >
            编辑
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

          <div v-if="hasMoreComments" class="load-more">
            <el-button :loading="loadingMoreComments" @click="loadMoreComments">
              加载更多评论
            </el-button>
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

        <!-- 编辑对话框 -->
        <el-dialog v-model="editVisible" title="编辑帖子" width="600px">
          <el-form label-position="top">
            <el-form-item label="标题">
              <el-input v-model="editForm.title" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="editForm.content" type="textarea" :rows="6" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="editVisible = false">取消</el-button>
            <el-button type="primary" :loading="editLoading" @click="submitEdit">
              保存
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
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { postApi } from '@/api/post'
import { createReport } from '@/api/report'
import { useAuthStore } from '@/stores/auth'
import LevelBadge from '@/components/LevelBadge.vue'
import { formatTime } from '@/utils/format'

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return DOMPurify.sanitize(marked(post.value.content))
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isOwner = computed(() => post.value?.author?.id === authStore.user?.id)

const reportVisible = ref(false)
const reportReason = ref('')
const reportLoading = ref(false)

const editVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({ title: '', content: '' })

const loading = ref(true)
const post = ref(null)
const comments = ref([])
const commentContent = ref('')
const commentLoading = ref(false)
const commentPage = ref(1)
const commentTotal = ref(0)
const loadingMoreComments = ref(false)

const replyVisible = ref(false)
const replyContent = ref('')
const replyLoading = ref(false)
const replyTarget = ref(null)
const replyPlaceholder = ref('')

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

const loadComments = async (reset = true) => {
  if (reset) {
    commentPage.value = 1
    comments.value = []
  }
  const res = await postApi.getComments(route.params.id, {
    page: commentPage.value,
    pageSize: 20
  })
  if (reset) {
    comments.value = res.data.list
  } else {
    comments.value.push(...res.data.list)
  }
  commentTotal.value = res.data.total
}

const hasMoreComments = computed(() => comments.value.length < commentTotal.value)

const loadMoreComments = async () => {
  loadingMoreComments.value = true
  try {
    commentPage.value++
    await loadComments(false)
  } finally {
    loadingMoreComments.value = false
  }
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

const openEdit = () => {
  editForm.value = {
    title: post.value.title,
    content: post.value.content
  }
  editVisible.value = true
}

const submitEdit = async () => {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  editLoading.value = true
  try {
    const res = await postApi.updatePost(route.params.id, editForm.value)
    post.value.title = res.data.title
    post.value.content = res.data.content
    editVisible.value = false
    ElMessage.success('帖子已更新')
  } catch {
    // handled by interceptor
  } finally {
    editLoading.value = false
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
@import '@/assets/styles/main.scss';

.post-detail-page {
  .loading {
    padding: 40px;
  }

  .post-card {
    background: var(--bg-card);
    border-radius: 8px;
    padding: 24px;
    transition: background-color 0.3s;
    margin-bottom: 16px;

    @include mobile { padding: 16px; }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      @include mobile {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

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
            color: var(--text-primary);
          }

          .level {
            font-size: 12px;
            color: var(--primary-color);
          }
        }
      }

      .post-meta-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .tieba-tag {
          padding: 2px 10px;
          background: color-mix(in srgb, var(--primary-color) 10%, transparent);
          color: var(--primary-color);
          border-radius: 4px;
          font-size: 13px;
          text-decoration: none;
        }

        .time {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }

    .post-title {
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;

      @include mobile { font-size: 18px; }
    }

    .post-content {
      font-size: 15px;
      color: var(--text-primary);
      line-height: 1.8;
      word-break: break-word;

      &.markdown-body {
        :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
          margin: 16px 0 8px;
          font-weight: 600;
        }
        :deep(h1) { font-size: 1.5em; }
        :deep(h2) { font-size: 1.3em; }
        :deep(h3) { font-size: 1.1em; }

        :deep(p) { margin: 8px 0; }

        :deep(code) {
          background: var(--bg-hover);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        :deep(pre) {
          background: var(--bg-hover);
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 12px 0;

          code {
            background: none;
            padding: 0;
          }
        }

        :deep(blockquote) {
          border-left: 4px solid var(--border-color);
          padding: 4px 16px;
          margin: 12px 0;
          color: var(--text-secondary);
        }

        :deep(ul), :deep(ol) {
          padding-left: 24px;
          margin: 8px 0;
        }

        :deep(img) {
          max-width: 100%;
          border-radius: 8px;
        }

        :deep(a) {
          color: var(--primary-color);
          text-decoration: none;
          &:hover { text-decoration: underline; }
        }

        :deep(table) {
          border-collapse: collapse;
          margin: 12px 0;
          th, td {
            border: 1px solid var(--border-color);
            padding: 8px 12px;
          }
          th { background: var(--bg-hover); }
        }

        :deep(hr) {
          border: none;
          border-top: 1px solid var(--border-color-light);
          margin: 16px 0;
        }
      }
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

        @include mobile { width: calc(33.33% - 6px); height: auto; aspect-ratio: 1; }
      }
    }

    .post-stats {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color-light);
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      gap: 16px;
    }

    .post-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;

      .essence-tag {
        margin-left: auto;
      }
    }
  }

  .comments-section {
    background: var(--bg-card);
    border-radius: 8px;
    padding: 24px;

    @include mobile { padding: 16px; }

    h3 {
      font-size: 16px;
      color: var(--text-primary);
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

      .load-more {
        text-align: center;
        padding: 16px 0;
      }

      .comment-item {
        padding: 16px 0;
        border-bottom: 1px solid var(--border-color-light);

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
            flex-wrap: wrap;

            .author-name {
              font-weight: 500;
              color: var(--text-primary);
            }

            .floor {
              color: var(--text-secondary);
            }

            .time {
              color: var(--text-placeholder);
            }
          }
        }

        .comment-body {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 42px;

          @include mobile { padding-left: 0; }
        }

        .replies {
          margin-left: 42px;
          margin-bottom: 8px;
          padding: 8px 12px;
          background: var(--bg-hover);
          border-radius: 4px;

          @include mobile { margin-left: 0; }

          .reply-item {
            font-size: 13px;
            color: var(--text-regular);
            line-height: 1.8;

            .reply-author {
              color: var(--primary-color);
              font-weight: 500;
            }

            .reply-to {
              color: var(--primary-color);
            }
          }
        }

        .comment-actions {
          padding-left: 42px;

          @include mobile { padding-left: 0; }
        }
      }
    }
  }
}
</style>
