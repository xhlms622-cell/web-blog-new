# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

南师大贴吧 (NNU Tieba) — 类百度贴吧的校园论坛系统。前后端分离架构，开发中。

## 常用命令

```bash
# 后端（在 backend/ 目录下）
npm run dev          # nodemon 热重载启动（端口 3000）
npm start            # 直接 node 启动

# 前端（在 frontend/ 目录下）
npm run dev          # Vite 开发服务器（端口 5173）
npm run build        # 生产构建
npm run preview      # 预览构建产物
```

## 数据库

Sealos 云端 MySQL，数据库名 `mydb`，配置在 `backend/.env`。
启动后端时 `sequelize.sync({ alter: true })` 自动同步表结构，无需手动执行 SQL。
`database/schema.sql` 和 `database/seeds.sql` 仅作参考备份。

项目无测试框架、无 linter 配置。

## 架构

### 目录结构

```
├── backend/           # Express 后端（CommonJS）
│   ├── config/        # 数据库、JWT、CORS 配置（从 .env 读取）
│   ├── controllers/   # 请求处理，每个函数 async + try/catch + next(error)
│   ├── middlewares/    # auth(JWT验证)、errorHandler、permission、validator
│   ├── models/        # Sequelize 模型，关联关系在 models/index.js 中统一定义
│   ├── routes/        # Express 路由，index.js 汇总各子路由
│   ├── services/      # 业务逻辑（目前为空目录）
│   ├── sockets/       # Socket.io（目前为空目录）
│   ├── utils/         # ApiResponse 统一响应、token/password/level 工具
│   └── validators/    # express-validator 验证规则
│
├── frontend/          # Vue 3 前端（ES Module）
│   └── src/
│       ├── api/       # Axios 请求封装（api/index.js 统一导出）
│       ├── stores/    # Pinia 状态管理
│       ├── views/     # 页面组件（按功能模块分子目录）
│       ├── components/# 可复用组件
│       ├── layouts/   # DefaultLayout / AdminLayout
│       ├── router/    # Vue Router，含路由守卫（requiresAuth / requiresAdmin）
│       └── utils/     # request.js（Axios 实例 + 拦截器）
│
├── database/          # MySQL 脚本（init.sql → schema.sql + seeds.sql）
└── docs/              # 文档目录（目前为空）
```

### 后端约定

- **统一响应格式**: `ApiResponse.success(data, message)` → `{ code: 200, message, data }`；`ApiResponse.error(message, code)` → `{ code, message }`；分页用 `ApiResponse.paginate(list, page, pageSize, total)`
- **错误处理**: controller 中 `catch(error) { next(error) }`，由 `middlewares/errorHandler.js` 统一处理（Sequelize 验证错误、JWT 错误、500 等）
- **认证**: `middlewares/auth.js` 导出 `auth`（必须登录）和 `optionalAuth`（可选登录），从 `Authorization: Bearer <token>` 提取 JWT
- **数据库同步**: 开发环境用 `sequelize.sync({ alter: true })` 自动同步模型到数据库
- **新增模块流程**: 在 `models/` 定义模型 → `models/index.js` 添加关联 → `controllers/` 写处理函数 → `routes/` 注册路由 → `routes/index.js` 挂载子路由

### 前端约定

- **API 代理**: Vite 开发服务器将 `/api` 和 `/uploads` 请求代理到 `http://localhost:3000`
- **自动导入**: unplugin-auto-import 自动导入 Vue/Vue Router/Pinia API；unplugin-vue-components 自动导入 Element Plus 组件
- **路由守卫**: `router/index.js` 中根据 `meta.requiresAuth`、`meta.requiresAdmin`、`meta.guest` 控制访问
- **样式**: 使用 SCSS（`assets/styles/main.scss`），`@` 别名指向 `src/`
- **Element Plus**: 全局注册，中文 locale

### 数据库核心模型关系

- User ↔ UserFollow: 多对多关注关系
- User → Post → Comment → Reply: 帖子 → 评论 → 回复的层级结构
- User ↔ Tieba（通过 TiebaFollow）: 用户关注贴吧
- Tieba → TiebaCategory: 贴吧分类
- Post ↔ User（通过 Like/Favorite）: 点赞、收藏
- ChatConversation ↔ ChatMessage: 私信会话
- PointLog / Level: 用户积分等级体系

## 开发进度

- [x] 项目架构搭建
- [x] 用户认证模块（注册/登录/JWT）
- [x] 贴吧模块（分类/列表/详情/创建/关注）
- [x] 帖子模块（创建/详情/列表/点赞/收藏/图片上传）
- [x] 评论模块（评论/回复/楼层号）
- [x] 搜索功能（帖子/贴吧/用户分类搜索）
- [x] 用户主页/设置（资料编辑/密码修改/关注）
- [x] 通知列表页面（类型筛选/分页/标记已读）
- [x] 私信聊天（Socket.io 实时通信/会话列表/消息历史）
- [x] 管理后台（Dashboard/用户/贴吧/帖子/举报/分类管理）
- [x] 吧主管理系统（概览/帖子管理/成员管理/举报管理）
- [x] 热点排行（加权评分/时间衰减/日榜/周榜）
- [x] 举报功能（用户举报/管理员处理）
- [x] 帖子/贴吧删除（权限控制）
