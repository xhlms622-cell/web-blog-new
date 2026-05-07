<template>
  <div class="profile-page">
    <div v-if="loading" class="loading"><el-skeleton :rows="5" animated /></div>

    <template v-else-if="profile">
      <div class="profile-header">
        <el-avatar :size="80" :src="profile.avatar">
          {{ profile.nickname?.charAt(0) }}
        </el-avatar>
        <div class="profile-info">
          <div class="name-row">
            <h1>{{ profile.nickname }}</h1>
            <LevelBadge :level="profile.level" :experience="profile.experience" size="default" />
          </div>
          <p class="signature">{{ profile.signature || '这个人很懒，什么都没写' }}</p>
          <div class="stats">
            <span class="stat-click" @click="showFollowDialog('followers')">{{ profile.followersCount }} 粉丝</span>
            <span class="stat-click" @click="showFollowDialog('following')">{{ profile.followingCount }} 关注</span>
            <span>{{ profile.postsCount }} 帖子</span>
          </div>
        </div>
        <div class="profile-actions" v-if="!isSelf && authStore.isLoggedIn">
          <el-button
            :type="profile.isFollowed ? 'default' : 'primary'"
            @click="handleFollow"
          >
            {{ profile.isFollowed ? '已关注' : '关注' }}
          </el-button>
          <el-button @click="$router.push(`/chat/${profile.id}`)">私信</el-button>
        </div>
        <el-button v-if="isSelf" @click="$router.push('/settings')">编辑资料</el-button>
      </div>

      <!-- 等级详情卡片（仅自己可见） -->
      <div v-if="isSelf && levelInfo" class="level-card">
        <div class="level-card-header">
          <div class="level-main">
            <LevelBadge :level="levelInfo.level" size="large" :show-tooltip="false" />
            <span class="level-name">{{ levelInfo.levelName }}</span>
          </div>
          <div class="level-actions">
            <el-button size="small" @click="showRules">经验规则</el-button>
            <el-button
              :type="checkedIn ? 'info' : 'primary'"
              :disabled="checkedIn"
              size="small"
              @click="handleCheckIn"
            >
              {{ checkedIn ? '已签到' : '签到 +5' }}
            </el-button>
          </div>
        </div>
        <div class="level-progress">
          <div class="progress-text">
            <span>经验 {{ levelInfo.experience }} / {{ levelInfo.nextRequired }}</span>
            <span>{{ levelInfo.progress }}%</span>
          </div>
          <el-progress :percentage="levelInfo.progress" :show-text="false" :stroke-width="8" />
          <div class="progress-label">
            <span>{{ levelInfo.levelName }}</span>
            <span>{{ levelInfo.nextLevelName }}</span>
          </div>
        </div>
        <div class="level-stats">
          <div class="stat-item">
            <span class="stat-value">{{ levelInfo.points }}</span>
            <span class="stat-label">积分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ levelInfo.dailyEarned }}/{{ levelInfo.dailyLimit }}</span>
            <span class="stat-label">今日经验</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ levelInfo.dailyRemaining }}</span>
            <span class="stat-label">今日剩余</span>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="帖子" name="posts">
          <PostList :posts="posts" :loading="postsLoading" />
          <div v-if="posts.length === 0 && !postsLoading" class="empty">暂无帖子</div>
        </el-tab-pane>
        <el-tab-pane v-if="isSelf" label="经验记录" name="expHistory">
          <div class="exp-history">
            <div v-if="expHistoryLoading" class="loading"><el-skeleton :rows="5" animated /></div>
            <template v-else>
              <div v-if="expHistory.length === 0" class="empty">暂无记录</div>
              <div v-for="log in expHistory" :key="log.id" class="exp-log-item">
                <div class="exp-log-info">
                  <span class="exp-log-desc">{{ log.description || log.type }}</span>
                  <span class="exp-log-time">{{ formatTime(log.created_at) }}</span>
                </div>
                <span class="exp-log-points" :class="log.points > 0 ? 'positive' : 'negative'">
                  {{ log.points > 0 ? '+' : '' }}{{ log.points }}
                </span>
              </div>
              <div v-if="expHistoryTotal > 20" class="exp-pagination">
                <el-pagination
                  small layout="prev, pager, next"
                  :total="expHistoryTotal" :page-size="20"
                  v-model:current-page="expHistoryPage"
                  @current-change="loadExpHistory"
                />
              </div>
            </template>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>

    <el-empty v-else description="用户不存在" />

    <!-- 经验规则弹窗 -->
    <el-dialog v-model="rulesVisible" title="经验规则" width="580px">
      <div v-if="rulesData" class="rules-content">
        <h4>获取经验</h4>
        <el-table :data="rulesData.rules" size="small" stripe>
          <el-table-column prop="description" label="行为" width="120" />
          <el-table-column prop="exp" label="经验" width="80" align="center" />
          <el-table-column prop="constraint" label="限制" />
        </el-table>
        <div class="rules-note">
          <p>每日经验上限：<strong>{{ rulesData.dailyLimit }}</strong>（收到点赞类上限 {{ rulesData.dailyLikeLimit }}）</p>
        </div>

        <h4>等级表</h4>
        <el-table :data="rulesData.levels" size="small" stripe max-height="300">
          <el-table-column prop="level" label="等级" width="70" align="center" />
          <el-table-column prop="name" label="名称" width="100" />
          <el-table-column label="升级所需经验">
            <template #default="{ row }">
              {{ row.required }} 经验
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog v-model="followDialogVisible" :title="followDialogTitle" width="420px">
      <div v-loading="followLoading" class="follow-list">
        <div v-if="followList.length === 0 && !followLoading" class="empty">暂无数据</div>
        <div v-for="user in followList" :key="user.id" class="follow-item" @click="$router.push(`/user/${user.id}`); followDialogVisible = false">
          <el-avatar :size="36" :src="user.avatar">{{ user.nickname?.charAt(0) }}</el-avatar>
          <div class="follow-info">
            <div class="follow-name">{{ user.nickname }}</div>
            <div class="follow-sig">{{ user.signature || '' }}</div>
          </div>
        </div>
      </div>
      <div v-if="followTotal > 20" class="follow-pagination">
        <el-pagination small layout="prev, pager, next" :total="followTotal" :page-size="20" v-model:current-page="followPage" @current-change="loadFollowList" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'
import { levelApi } from '@/api/level'
import { useAuthStore } from '@/stores/auth'
import PostList from '@/components/post/PostList.vue'
import LevelBadge from '@/components/LevelBadge.vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const formatTime = (time) => dayjs(time).fromNow()

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const profile = ref(null)
const posts = ref([])
const postsLoading = ref(false)
const activeTab = ref('posts')

const isSelf = computed(() => authStore.user?.id === parseInt(route.params.id))

// 等级相关
const levelInfo = ref(null)
const checkedIn = ref(false)
const expHistory = ref([])
const expHistoryLoading = ref(false)
const expHistoryPage = ref(1)
const expHistoryTotal = ref(0)
const rulesVisible = ref(false)
const rulesData = ref(null)

// 粉丝/关注弹窗
const followDialogVisible = ref(false)
const followDialogTitle = ref('')
const followType = ref('followers')
const followList = ref([])
const followLoading = ref(false)
const followPage = ref(1)
const followTotal = ref(0)

const showFollowDialog = (type) => {
  followType.value = type
  followDialogTitle.value = type === 'followers' ? '粉丝' : '关注'
  followPage.value = 1
  followDialogVisible.value = true
  loadFollowList()
}

const loadFollowList = async () => {
  followLoading.value = true
  try {
    const fn = followType.value === 'followers' ? userApi.getFollowers : userApi.getFollowing
    const res = await fn(route.params.id, { page: followPage.value, pageSize: 20 })
    followList.value = res.data.list
    followTotal.value = res.data.pagination.total
  } catch { /* handled */ } finally { followLoading.value = false }
}

const loadLevelInfo = async () => {
  if (!isSelf.value) return
  try {
    const res = await levelApi.getLevelInfo()
    levelInfo.value = res.data
    checkedIn.value = !!res.data.checkedIn
  } catch { /* handled */ }
}

const loadExpHistory = async () => {
  if (!isSelf.value) return
  expHistoryLoading.value = true
  try {
    const res = await levelApi.getExpHistory({ page: expHistoryPage.value, pageSize: 20 })
    expHistory.value = res.data.list
    expHistoryTotal.value = res.data.pagination.total
  } catch { /* handled */ } finally { expHistoryLoading.value = false }
}

const handleCheckIn = async () => {
  try {
    const res = await levelApi.checkIn()
    ElMessage.success(res.message)
    checkedIn.value = true
    await loadLevelInfo()
  } catch { /* handled */ }
}

const showRules = async () => {
  rulesVisible.value = true
  if (!rulesData.value) {
    try {
      const res = await levelApi.getRules()
      rulesData.value = res.data
    } catch { /* handled */ }
  }
}

const loadProfile = async () => {
  loading.value = true
  try {
    const res = await userApi.getProfile(route.params.id)
    profile.value = res.data
    await Promise.all([loadPosts(), loadLevelInfo()])
  } finally {
    loading.value = false
  }
}

const loadPosts = async () => {
  postsLoading.value = true
  try {
    const res = await userApi.getUserPosts(route.params.id)
    posts.value = res.data.list
  } finally {
    postsLoading.value = false
  }
}

const handleFollow = async () => {
  try {
    const res = await userApi.followUser(route.params.id)
    profile.value.isFollowed = res.data.isFollowed
    profile.value.followersCount += res.data.isFollowed ? 1 : -1
    ElMessage.success(res.message)
  } catch (error) { /* handled */ }
}

watch(activeTab, (tab) => {
  if (tab === 'expHistory' && expHistory.value.length === 0) loadExpHistory()
})

onMounted(() => loadProfile())
watch(() => route.params.id, (id) => { if (id) loadProfile() })
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.profile-page {
  .loading { padding: 40px; }
  .empty { padding: 40px; text-align: center; color: #909399; }

  .profile-header {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 16px;

    @include mobile {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 16px;
    }

    .profile-info {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        gap: 8px;

        @include mobile { justify-content: center; }

        h1 { font-size: 22px; color: #303133; margin: 0; @include mobile { font-size: 20px; } }
      }

      .signature { font-size: 14px; color: #909399; margin: 8px 0; }
      .stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #606266;

        @include mobile { justify-content: center; }

        .stat-click {
          cursor: pointer;
          &:hover { color: #409eff; }
        }
      }
    }

    .profile-actions {
      display: flex;
      gap: 8px;

      @include mobile { justify-content: center; width: 100%; }
    }
  }

  .level-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;

    @include mobile { padding: 16px; }

    .level-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 8px;

      .level-main {
        display: flex;
        align-items: center;
        gap: 10px;

        .level-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .level-progress {
      margin-bottom: 16px;

      .progress-text {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #606266;
        margin-bottom: 6px;
      }

      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .level-stats {
      display: flex;
      gap: 24px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      flex-wrap: wrap;

      @include mobile { gap: 16px; justify-content: center; }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 60px;

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }

  .exp-history {
    .exp-log-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      .exp-log-info {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .exp-log-desc {
          font-size: 14px;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .exp-log-time {
          font-size: 12px;
          color: #c0c4cc;
          margin-top: 2px;
        }
      }

      .exp-log-points {
        font-size: 14px;
        font-weight: 500;
        flex-shrink: 0;

        &.positive { color: #67c23a; }
        &.negative { color: #f56c6c; }
      }
    }

    .exp-pagination {
      margin-top: 12px;
      display: flex;
      justify-content: center;
    }
  }

  .follow-list {
    min-height: 100px;

    .empty { text-align: center; color: #909399; padding: 40px 0; }

    .follow-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;

      &:hover { background: #f5f7fa; }
      &:last-child { border-bottom: none; }

      .follow-info {
        flex: 1;
        min-width: 0;

        .follow-name { font-size: 14px; font-weight: 500; color: #303133; }
        .follow-sig { font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }
    }
  }

  .follow-pagination {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }

  .level-actions {
    display: flex;
    gap: 8px;
  }

  .rules-content {
    h4 {
      font-size: 15px;
      color: #303133;
      margin: 16px 0 10px;
      &:first-child { margin-top: 0; }
    }

    .rules-note {
      margin-top: 10px;
      font-size: 13px;
      color: #606266;
      padding: 8px 12px;
      background: #fdf6ec;
      border-radius: 4px;

      p { margin: 0; }
    }
  }
}
</style>
