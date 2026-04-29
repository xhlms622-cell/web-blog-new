require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config/index');

const server = http.createServer(app);

const PORT = config.port;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: config.env === 'development' });
    console.log('数据库同步完成');

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
