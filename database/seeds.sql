-- 种子数据

USE `mydb`;

-- 插入等级配置
INSERT INTO levels (level, name, min_experience, created_at) VALUES
(1, '萌新', 0, NOW()),
(2, '初级会员', 100, NOW()),
(3, '中级会员', 400, NOW()),
(4, '高级会员', 900, NOW()),
(5, '资深会员', 1600, NOW()),
(6, '元老', 2500, NOW()),
(7, '大神', 3600, NOW()),
(8, '传奇', 4900, NOW()),
(9, '至尊', 6400, NOW()),
(10, '神话', 8100, NOW());

-- 插入贴吧分类
INSERT INTO tieba_categories (name, icon, sort_order, created_at) VALUES
('学习交流', '📚', 1, NOW()),
('校园生活', '🏫', 2, NOW()),
('兴趣爱好', '🎮', 3, NOW()),
('社团组织', '👥', 4, NOW()),
('情感天地', '💕', 5, NOW()),
('二手交易', '💰', 6, NOW()),
('求助问答', '❓', 7, NOW()),
('其他', '📌', 99, NOW());

-- 插入管理员账号 (密码: admin123)
INSERT INTO users (email, password, nickname, role, status, points, level, experience, created_at, updated_at) VALUES
('admin@nnu.edu.cn', '$2a$10$jx535/Omvmgwr4iOtRS//ubmozGKDHBjDoLX.lIa0OPdv1gZ8mMdK', '管理员', 'admin', 1, 1000, 5, 1600, NOW(), NOW());

-- 插入示例贴吧
INSERT INTO tiebas (name, description, category_id, member_count, post_count, created_at, updated_at) VALUES
('南师大大神榜', '南师大最强学霸集结地', 1, 100, 50, NOW(), NOW()),
('随园校区', '随园校区生活交流', 2, 200, 80, NOW(), NOW()),
('仙林校区', '仙林校区生活交流', 2, 300, 120, NOW(), NOW()),
('考研交流', '考研经验分享与交流', 1, 150, 60, NOW(), NOW()),
('吃货联盟', '南师大美食探店分享', 3, 180, 70, NOW(), NOW());
