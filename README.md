# 南师大贴吧 (NNU Tieba)

一个类似百度贴吧的博客系统，专门用于南师大学生之间交流。

## 技术栈

### 前端
- Vue 3.4 + Vite 5
- Element Plus 2.4
- Pinia 状态管理
- Vue Router 4
- Axios 请求库
- Socket.io-client 实时通信

### 后端
- Node.js + Express 4.18
- Sequelize ORM
- MySQL 8.0
- JWT 认证
- Socket.io 实时通信

## 项目结构

```
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── api/       # API请求
│   │   ├── assets/    # 静态资源
│   │   ├── components/# 组件
│   │   ├── layouts/   # 布局
│   │   ├── router/    # 路由
│   │   ├── stores/    # 状态管理
│   │   ├── utils/     # 工具函数
│   │   └── views/     # 页面
│   └── package.json
│
├── backend/            # 后端项目
│   ├── config/        # 配置
│   ├── controllers/   # 控制器
│   ├── middlewares/   # 中间件
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── services/      # 业务逻辑
│   ├── sockets/       # WebSocket
│   ├── utils/         # 工具函数
│   └── validators/    # 验证器
│
└── database/           # 数据库脚本
    ├── schema.sql     # 表结构
    ├── seeds.sql      # 种子数据
    └── init.sql       # 初始化脚本
```

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置数据库

```bash
# 创建MySQL数据库并导入表结构
mysql -u root -p < database/init.sql
```

修改 `backend/.env` 文件中的数据库配置：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=nnu_tieba
```

### 3. 启动服务

```bash
# 启动后端服务 (在 backend 目录)
npm run dev

# 启动前端服务 (在 frontend 目录)
npm run dev
```

### 4. 访问应用

- 前端地址: http://localhost:5173
- 后端API: http://localhost:3000/api

## 功能模块

### 用户系统
- 邮箱+密码注册登录
- 个人主页
- 关注/粉丝系统
- 积分等级

### 贴吧系统
- 贴吧分类
- 创建贴吧
- 关注贴吧
- 吧主管理

### 帖子系统
- 发帖回帖
- 楼层回复
- 点赞收藏
- 置顶精华

### 社交功能
- 实时私信
- 消息通知
- 全文搜索

### 管理后台
- 用户管理
- 贴吧管理
- 帖子管理
- 举报处理

## 开发进度

- [x] 项目架构搭建
- [x] 用户认证模块
- [ ] 贴吧模块
- [ ] 帖子模块
- [ ] 评论模块
- [ ] 社交功能
- [ ] 管理后台

## 许可证

MIT
