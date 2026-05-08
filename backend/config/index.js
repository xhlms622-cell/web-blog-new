require('dotenv').config();

// 启动时校验必要环境变量
const requiredEnvVars = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`错误: 缺少必要环境变量 ${key}，请检查 .env 文件`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'nnu_tieba'
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
};
