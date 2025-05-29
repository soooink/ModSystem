/**
 * 示例插件A - 内容管理
 * 演示插件系统的基本功能
 */
const express = require('express');
const { createPluginLogger } = require('../../utils/logger');
const { asyncHandler } = require('../../utils/apiHelper');
const { verifyToken } = require('../../core/middleware/auth');

/**
 * 插件初始化函数
 * @param {Express.Application} app - Express应用实例
 * @returns {Object} 插件对象
 */
module.exports = function(app) {
  // 创建插件日志记录器
  const logger = createPluginLogger('content-manager');
  
  // 创建路由器
  const router = express.Router();
  
  // 定义内容管理模型
  const contentItems = [
    { id: 1, title: '示例内容1', body: '这是示例内容1的正文', createdAt: new Date() },
    { id: 2, title: '示例内容2', body: '这是示例内容2的正文', createdAt: new Date() }
  ];
  
  // 获取所有内容
  router.get('/', asyncHandler(async (req, res) => {
    return res.json({
      success: true,
      data: contentItems,
      message: '获取内容列表成功'
    });
  }));
  
  // 获取单个内容
  router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const item = contentItems.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '内容不存在'
      });
    }
    
    return res.json({
      success: true,
      data: item,
      message: '获取内容成功'
    });
  }));
  
  // 需要身份验证的路由
  router.use(verifyToken);
  
  // 创建内容 (需要身份验证)
  router.post('/', asyncHandler(async (req, res) => {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: '标题和正文不能为空'
      });
    }
    
    const newItem = {
      id: contentItems.length + 1,
      title,
      body,
      createdAt: new Date(),
      createdBy: req.user.id
    };
    
    contentItems.push(newItem);
    
    return res.status(201).json({
      success: true,
      data: newItem,
      message: '内容创建成功'
    });
  }));
  
  // 返回插件对象
  return {
    id: 'content-manager',
    name: '内容管理',
    version: '1.0.0',
    description: '基本的内容管理插件',
    
    // 插件初始化方法
    initialize: async function() {
      logger.info('内容管理插件初始化');
    },
    
    // 插件激活方法
    activate: async function() {
      logger.info('内容管理插件已激活');
    },
    
    // 插件停用方法
    deactivate: async function() {
      logger.info('内容管理插件已停用');
    },
    
    // 插件路由
    routes: router,
    
    // 插件钩子
    hooks: {
      onServerStart: async (app) => {
        logger.info('服务器启动时，内容管理插件收到通知');
      },
      onUserLogin: async (user) => {
        logger.info(`用户 ${user.username} 登录时，内容管理插件收到通知`);
      }
    }
  };
};
