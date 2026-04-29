-- 南师大贴吧数据库初始化脚本
-- 注意：Sealos 云端数据库 mydb 已存在，不需要 CREATE DATABASE
-- 直接 USE 目标数据库
USE `mydb`;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) DEFAULT '/images/default-avatar.png',
    signature VARCHAR(255) DEFAULT '',
    gender TINYINT DEFAULT 0 COMMENT '0:保密 1:男 2:女',
    birthday DATE,
    points INT DEFAULT 0 COMMENT '积分',
    level INT DEFAULT 1 COMMENT '等级',
    experience INT DEFAULT 0 COMMENT '经验值',
    role ENUM('user', 'bar_owner', 'admin') DEFAULT 'user',
    status TINYINT DEFAULT 1 COMMENT '0:禁用 1:正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nickname (nickname),
    INDEX idx_points (points DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 等级配置表
CREATE TABLE IF NOT EXISTS levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level INT UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT '等级名称',
    min_experience INT NOT NULL COMMENT '所需最低经验',
    icon VARCHAR(255) COMMENT '等级图标',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 贴吧分类表
CREATE TABLE IF NOT EXISTS tieba_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 贴吧表
CREATE TABLE IF NOT EXISTS tiebas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    cover VARCHAR(255),
    category_id INT,
    owner_id INT COMMENT '吧主ID',
    member_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '0:关闭 1:正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_member_count (member_count DESC),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES tieba_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 贴吧关注表
CREATE TABLE IF NOT EXISTS tieba_follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tieba_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tieba_follow (user_id, tieba_id),
    INDEX idx_user (user_id),
    INDEX idx_tieba (tieba_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tieba_id) REFERENCES tiebas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户关注表
CREATE TABLE IF NOT EXISTS user_follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL COMMENT '关注者',
    following_id INT NOT NULL COMMENT '被关注者',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    images JSON COMMENT '图片URL数组',
    user_id INT NOT NULL,
    tieba_id INT NOT NULL,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶',
    is_essence TINYINT DEFAULT 0 COMMENT '是否精华',
    status TINYINT DEFAULT 1 COMMENT '0:删除 1:正常 2:隐藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_tieba (tieba_id),
    INDEX idx_created (created_at DESC),
    INDEX idx_status_top (status, is_top),
    FULLTEXT INDEX ft_title_content (title, content) WITH PARSER ngram,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tieba_id) REFERENCES tiebas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表（楼层）
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    images JSON,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    floor_number INT NOT NULL COMMENT '楼层号',
    like_count INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id),
    INDEX idx_floor (post_id, floor_number),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 楼层回复表
CREATE TABLE IF NOT EXISTS replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(500) NOT NULL,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    reply_to_id INT COMMENT '回复的回复ID',
    reply_to_user_id INT COMMENT '回复的用户ID',
    like_count INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comment (comment_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES replies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('post', 'comment', 'reply') NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_like (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_favorite (user_id, post_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消息通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '接收者',
    type ENUM('system', 'reply', 'like', 'follow', 'mention', 'report') NOT NULL,
    title VARCHAR(100),
    content TEXT,
    target_type ENUM('post', 'comment', 'user', 'report') COMMENT '关联对象类型',
    target_id INT,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 私信会话表
CREATE TABLE IF NOT EXISTS chat_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_conversation (user1_id, user2_id),
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 私信消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 举报表
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL COMMENT '举报人',
    target_type ENUM('post', 'comment', 'user') NOT NULL,
    target_id INT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending',
    handler_id INT COMMENT '处理人',
    result VARCHAR(500) COMMENT '处理结果',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 积分日志表
CREATE TABLE IF NOT EXISTS point_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points INT NOT NULL COMMENT '变动积分，正负数',
    type ENUM('post', 'comment', 'like_received', 'daily_login', 'favorited', 'punish') NOT NULL,
    target_type ENUM('post', 'comment') COMMENT '关联对象',
    target_id INT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
