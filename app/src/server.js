/**
 * 服务器入口文件
 * 初始化Express应用和插件系统
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { logger } = require('./utils/logger');
const config = require('./config/env');
const database = require('./core/database');
const PluginManager = require('./core/pluginManager');
const { registerPluginRoutes } = require('./api');

// 创建Express应用
const app = express();
const PORT = config.port;

// 中间件
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 初始化应用
async function initializeApp() {
  try {
    // 初始化数据库连接
    await database.initialize();
    logger.info('数据库初始化成功');

    // 创建插件管理器实例
    const pluginManager = new PluginManager(app);
    app.set('pluginManager', pluginManager);
    
    // 设置路由器实例
    const router = express.Router();
    app.set('router', router);

    // 注册核心事件监听器
    pluginManager.on('plugin:loaded', ({ pluginId }) => {
      logger.info(`插件已加载: ${pluginId}`);
    });

    pluginManager.on('plugin:activated', ({ pluginId }) => {
      logger.info(`插件已激活: ${pluginId}`);
    });

    pluginManager.on('plugin:deactivated', ({ pluginId }) => {
      logger.info(`插件已停用: ${pluginId}`);
    });

    pluginManager.on('plugin:error', ({ pluginId, error }) => {
      logger.error(`插件错误 [${pluginId}]: ${error.message}`);
    });

    // 预定义钩子点
    pluginManager.registerHook('onServerStart');
    pluginManager.registerHook('onRequest');
    pluginManager.registerHook('onResponse');
    pluginManager.registerHook('onUserLogin');
    pluginManager.registerHook('onUserLogout');

    // 加载所有插件
    await pluginManager.loadAllPlugins();
    logger.info('所有插件加载完成');

    // 根据配置自动激活插件
    if (config.env !== 'test' && require('./config/pluginConfig').settings.autoActivateAll) {
      const plugins = pluginManager.getAllPluginsMeta();
      for (const plugin of plugins) {
        try {
          await pluginManager.activatePlugin(plugin.id);
        } catch (error) {
          logger.error(`自动激活插件 ${plugin.id} 失败:`, error);
        }
      }
    }

    // 注册API路由
    registerPluginRoutes(app, pluginManager);

    // 触发服务器启动钩子
    await pluginManager.applyHook('onServerStart', app);

    // 全局错误处理
    app.use((err, req, res, next) => {
      logger.error('服务器错误:', err);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`服务器已启动，监听端口: ${PORT}`);
      logger.info(`环境: ${config.env}`);
    });

  } catch (error) {
    logger.error('应用初始化失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
});

// 初始化应用
initializeApp();
