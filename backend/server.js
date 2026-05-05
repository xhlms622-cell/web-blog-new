require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize, TiebaCategory, Level } = require('./models');
const config = require('./config/index');
const { initSocket } = require('./sockets/chat');

const server = http.createServer(app);

// 初始化 Socket.io
initSocket(server);

const PORT = config.port;

async function seedDefaults() {
  // 贴吧分类
  const catCount = await TiebaCategory.count();
  if (catCount === 0) {
    await TiebaCategory.bulkCreate([
      { name: '学习', icon: '📚', sort_order: 1 },
      { name: '生活', icon: '🏠', sort_order: 2 },
      { name: '娱乐', icon: '🎮', sort_order: 3 },
      { name: '社团', icon: '🎯', sort_order: 4 },
      { name: '二手', icon: '🛒', sort_order: 5 },
      { name: '表白墙', icon: '💌', sort_order: 6 },
      { name: '问答', icon: '❓', sort_order: 7 },
      { name: '其他', icon: '💬', sort_order: 8 }
    ]);
    console.log('已预置默认贴吧分类');
  }

  // 等级数据
  const levelCount = await Level.count();
  if (levelCount === 0) {
    const levelNames = {
      1: '萌新', 2: '初级会员', 3: '中级会员', 4: '高级会员', 5: '资深会员',
      6: '元老', 7: '大神', 8: '传奇', 9: '至尊', 10: '神话'
    };
    const levelIcons = {
      1: '🌱', 2: '🌿', 3: '🌳', 4: '⭐', 5: '🌟',
      6: '💎', 7: '👑', 8: '🏆', 9: '🔱', 10: '🏅'
    };
    const levels = [];
    for (let i = 1; i <= 20; i++) {
      levels.push({
        level: i,
        name: levelNames[i] || `Lv.${i}`,
        min_experience: (i - 1) * (i - 1) * 100,
        icon: levelIcons[i] || '🎖️'
      });
    }
    await Level.bulkCreate(levels);
    console.log('已预置等级数据（1-20级）');
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync();
    console.log('数据库同步完成');

    await seedDefaults();

    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`访问地址: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，关闭服务器');
  server.close(() => {
    sequelize.close();
    process.exit(0);
  });
});
