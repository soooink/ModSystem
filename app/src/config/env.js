/**
 * 环境变量配置
 * 根据不同环境加载不同配置
 */
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  // 通用配置
  common: {
    port: process.env.PORT || 3000,
    apiPrefix: '/api',
  },

  // 开发环境配置
  development: {
    database: {
      uri: process.env.DB_URI || 'mongodb://localhost:27017/plugin-system-dev',
    },
    log: {
      level: 'debug',
    },
    cors: {
      origin: '*',
    },
  },

  // 生产环境配置
  production: {
    database: {
      uri: process.env.DB_URI,
    },
    log: {
      level: 'info',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
  },

  // 测试环境配置
  test: {
    database: {
      uri: process.env.TEST_DB_URI || 'mongodb://localhost:27017/plugin-system-test',
    },
    log: {
      level: 'warn',
    },
    cors: {
      origin: '*',
    },
  },
};

// 合并当前环境的配置与通用配置
module.exports = {
  ...config.common,
  ...config[env],
  env,
};
