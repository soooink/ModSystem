/**
 * API路由入口
 * 统一注册所有API路由
 */
const express = require('express');
const router = express.Router();

// 导入核心路由
const usersRoutes = require('./core/routes/users');
const appRoutes = require('./core/routes/app');

// 注册核心路由
router.use('/users', usersRoutes);
router.use('/app', appRoutes);

/**
 * 动态注册插件路由
 * @param {Express.Application} app - Express应用实例
 * @param {PluginManager} pluginManager - 插件管理器实例
 */
const registerPluginRoutes = (app, pluginManager) => {
  // 获取所有激活的插件
  const plugins = Array.from(pluginManager.plugins.values())
    .filter(plugin => pluginManager.pluginsMeta.get(plugin.id).enabled);

  // 遍历插件，注册路由
  plugins.forEach(plugin => {
    if (plugin.routes) {
      try {
        const pluginRouter = express.Router();
        
        // 如果routes是函数，传入router和app让它注册路由
        if (typeof plugin.routes === 'function') {
          plugin.routes(pluginRouter, app);
        } 
        // 如果routes是路由对象，直接使用
        else if (plugin.routes instanceof express.Router) {
          router.use(`/plugins/${plugin.id}`, plugin.routes);
          return;
        }
        // 如果routes是简单对象，遍历注册
        else if (typeof plugin.routes === 'object') {
          Object.entries(plugin.routes).forEach(([path, handler]) => {
            // 处理不同的请求方法和路径格式
            if (typeof handler === 'function') {
              pluginRouter.get(path, handler);
            } else if (typeof handler === 'object') {
              const { method = 'get', handler: routeHandler, middleware = [] } = handler;
              pluginRouter[method.toLowerCase()](path, ...middleware, routeHandler);
            }
          });
        }
        
        // 注册插件路由
        router.use(`/plugins/${plugin.id}`, pluginRouter);
        console.log(`已注册插件路由: /api/plugins/${plugin.id}`);
      } catch (error) {
        console.error(`注册插件 ${plugin.id} 路由失败:`, error);
      }
    }
  });

  // 将API路由挂载到应用
  app.use('/api', router);
};

module.exports = {
  router,
  registerPluginRoutes
};
