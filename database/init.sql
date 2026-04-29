-- 初始化脚本入口
-- 执行方式: mysql -u root -p < init.sql

SOURCE schema.sql;
SOURCE seeds.sql;

SELECT '数据库初始化完成!' AS message;
