import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'tiebas',
        name: 'TiebaList',
        component: () => import('@/views/tieba/TiebaList.vue'),
        meta: { title: '贴吧列表' }
      },
      {
        path: 'tieba/create',
        name: 'CreateTieba',
        component: () => import('@/views/tieba/CreateTieba.vue'),
        meta: { requiresAuth: true, title: '创建贴吧' }
      },
      {
        path: 'tieba/:id',
        name: 'TiebaDetail',
        component: () => import('@/views/tieba/TiebaDetail.vue'),
        meta: { title: '贴吧详情' }
      },
      {
        path: 'post/create/:tiebaId?',
        name: 'CreatePost',
        component: () => import('@/views/post/CreatePost.vue'),
        meta: { requiresAuth: true, title: '发表帖子' }
      },
      {
        path: 'post/:id',
        name: 'PostDetail',
        component: () => import('@/views/post/PostDetail.vue'),
        meta: { title: '帖子详情' }
      },
      {
        path: 'user/:id',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '用户主页' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/user/Settings.vue'),
        meta: { requiresAuth: true, title: '个人设置' }
      },
      {
        path: 'my/posts',
        name: 'MyPosts',
        component: () => import('@/views/user/MyPosts.vue'),
        meta: { requiresAuth: true, title: '我的帖子' }
      },
      {
        path: 'my/favorites',
        name: 'MyFavorites',
        component: () => import('@/views/user/MyFavorites.vue'),
        meta: { requiresAuth: true, title: '我的收藏' }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/message/Notification.vue'),
        meta: { requiresAuth: true, title: '消息通知' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/message/Chat.vue'),
        meta: { requiresAuth: true, title: '私信' }
      },
      {
        path: 'chat/:userId',
        name: 'ChatWith',
        component: () => import('@/views/message/Chat.vue'),
        meta: { requiresAuth: true, title: '私信' }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/Search.vue'),
        meta: { title: '搜索' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '管理后台' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'tiebas',
        name: 'AdminTiebas',
        component: () => import('@/views/admin/TiebaManage.vue'),
        meta: { title: '贴吧管理' }
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('@/views/admin/PostManage.vue'),
        meta: { title: '帖子管理' }
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('@/views/admin/ReportManage.vue'),
        meta: { title: '举报管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  document.title = to.meta.title ? `${to.meta.title} - 南师大贴吧` : '南师大贴吧'

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
