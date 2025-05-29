/**
 * 示例插件B - 用户统计
 * 演示插件之间的依赖和互操作性
 */
const express = require('express');
const { createPluginLogger } = require('../../utils/logger');
const { asyncHandler } = require('../../utils/apiHelper');
const { verifyToken, checkRole } = require('../../core/middleware/auth');

/**
 * 插件初始化函数
 * @param {Express.Application} app - Express应用实例
 * @returns {Object} 插件对象
 */
module.exports = function(app) {
  // 创建插件日志记录器
  const logger = createPluginLogger('user-stats');
  
  // 创建路由器
  const router = express.Router();
  
  // 统计数据 (实际应用中应该存储在数据库)
  let stats = {
    totalLogins: 0,
    activeUsers: 0,
    userActivities: {},
    lastUpdated: new Date()
  };
  
  // 需要身份验证的路由
  router.use(verifyToken);
  
  // 获取用户统计数据 (需要管理员权限)
  router.get('/', checkRole(['admin']), asyncHandler(async (req, res) => {
    return res.json({
      success: true,
      data: stats,
      message: '获取用户统计数据成功'
    });
  }));
  
  // 获取当前用户的活动统计
  router.get('/me', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userStats = stats.userActivities[userId] || { 
      logins: 0, 
      lastLogin: null,
      contentCreated: 0
    };
    
    return res.json({
      success: true,
      data: userStats,
      message: '获取个人统计数据成功'
    });
  }));
  
  // 模拟用户登录记录
  const recordLogin = (userId) => {
    stats.totalLogins++;
    stats.activeUsers++;
    
    if (!stats.userActivities[userId]) {
      stats.userActivities[userId] = {
        logins: 0,
        lastLogin: null,
        contentCreated: 0
      };
    }
    
    stats.userActivities[userId].logins++;
    stats.userActivities[userId].lastLogin = new Date();
    stats.lastUpdated = new Date();
    
    logger.info(`用户 ${userId} 登录已记录`);
  };
  
  // 模拟内容创建记录
  const recordContentCreation = (userId) => {
    if (!stats.userActivities[userId]) {
      stats.userActivities[userId] = {
        logins: 0,
        lastLogin: null,
        contentCreated: 0
      };
    }
    
    stats.userActivities[userId].contentCreated++;
    stats.lastUpdated = new Date();
    
    logger.info(`用户 ${userId} 内容创建已记录`);
  };
  
  // 返回插件对象
  return {
    id: 'user-stats',
    name: '用户统计',
    version: '1.0.0',
    description: '用户活动统计插件',
    dependencies: ['content-manager'], // 依赖内容管理插件
    
    // 插件初始化方法
    initialize: async function() {
      logger.info('用户统计插件初始化');
    },
    
    // 插件激活方法
    activate: async function() {
      logger.info('用户统计插件已激活');
      
      // 导出API给其他插件使用
      app.set('userStatsAPI', {
        recordLogin,
        recordContentCreation,
        getStats: () => stats
      });
    },
    
    // 插件停用方法
    deactivate: async function() {
      logger.info('用户统计插件已停用');
      app.set('userStatsAPI', null);
    },
    
    // 插件路由
    routes: router,
    
    // 插件钩子
    hooks: {
      // 用户登录时记录统计
      onUserLogin: async (user) => {
        recordLogin(user.id);
        logger.info(`用户 ${user.username} 登录已统计`);
      },
      
      // 服务器启动时初始化统计数据
      onServerStart: async (app) => {
        logger.info('服务器启动时，用户统计插件收到通知');
        stats = {
          totalLogins: 0,
          activeUsers: 0,
          userActivities: {},
          lastUpdated: new Date()
        };
      }
    }
  };
};
