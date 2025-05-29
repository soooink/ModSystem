/**
 * 插件管理器
 * 负责插件的注册、加载、启用和禁用
 */
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const { PluginEvents } = require('./types');

class PluginManager extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.plugins = new Map(); // 存储已注册的插件
    this.pluginsMeta = new Map(); // 存储插件元数据
    this.pluginsPath = path.join(process.cwd(), 'src', 'plugins');
    this.hooks = {}; // 插件钩子系统
  }

  /**
   * 注册插件钩子点
   * @param {string} hookName - 钩子名称
   */
  registerHook(hookName) {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = [];
    }
  }

  /**
   * 在钩子上添加回调
   * @param {string} hookName - 钩子名称
   * @param {Function} callback - 回调函数
   * @param {string} pluginId - 插件ID
   */
  addHook(hookName, callback, pluginId) {
    if (!this.hooks[hookName]) {
      this.registerHook(hookName);
    }
    this.hooks[hookName].push({ callback, pluginId });
  }

  /**
   * 触发钩子
   * @param {string} hookName - 钩子名称
   * @param {...any} args - 传递给钩子的参数
   */
  async applyHook(hookName, ...args) {
    if (!this.hooks[hookName]) {
      return;
    }

    const results = [];
    for (const { callback } of this.hooks[hookName]) {
      try {
        results.push(await callback(...args));
      } catch (error) {
        console.error(`Error executing hook ${hookName}:`, error);
      }
    }
    return results;
  }

  /**
   * 注册插件
   * @param {Object} plugin - 插件对象
   */
  registerPlugin(plugin) {
    if (!plugin.id || this.plugins.has(plugin.id)) {
      throw new Error(`插件ID错误或已存在: ${plugin.id}`);
    }

    // 检查依赖
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      for (const depId of plugin.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(`插件 ${plugin.id} 依赖的插件 ${depId} 未找到`);
        }
      }
    }

    // 存储插件及元数据
    this.plugins.set(plugin.id, plugin);
    this.pluginsMeta.set(plugin.id, {
      id: plugin.id,
      name: plugin.name || plugin.id,
      version: plugin.version || '1.0.0',
      description: plugin.description || '',
      enabled: false,
      dependencies: plugin.dependencies || []
    });

    return plugin;
  }

  /**
   * 加载所有插件
   */
  async loadAllPlugins() {
    if (!fs.existsSync(this.pluginsPath)) {
      console.warn(`插件目录不存在: ${this.pluginsPath}`);
      return;
    }

    const pluginDirs = fs.readdirSync(this.pluginsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pluginDir of pluginDirs) {
      try {
        await this.loadPlugin(pluginDir);
      } catch (error) {
        console.error(`加载插件 ${pluginDir} 失败:`, error);
        this.emit(PluginEvents.ERROR, { pluginId: pluginDir, error });
      }
    }
  }

  /**
   * 加载单个插件
   * @param {string} pluginId - 插件ID
   */
  async loadPlugin(pluginId) {
    const pluginPath = path.join(this.pluginsPath, pluginId);
    const pluginIndexPath = path.join(pluginPath, 'index.js');

    if (!fs.existsSync(pluginIndexPath)) {
      throw new Error(`插件入口文件不存在: ${pluginIndexPath}`);
    }

    // 动态导入插件
    try {
      const pluginModule = require(pluginIndexPath);
      const plugin = typeof pluginModule === 'function' 
        ? pluginModule(this.app) 
        : pluginModule;

      if (!plugin.id) {
        plugin.id = pluginId;
      }

      this.registerPlugin(plugin);
      
      // 初始化插件
      if (typeof plugin.initialize === 'function') {
        await plugin.initialize(this.app);
      }

      this.emit(PluginEvents.LOADED, { pluginId });
      return plugin;
    } catch (error) {
      throw new Error(`加载插件 ${pluginId} 失败: ${error.message}`);
    }
  }

  /**
   * 激活插件
   * @param {string} pluginId - 插件ID
   */
  async activatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    const meta = this.pluginsMeta.get(pluginId);

    if (!plugin) {
      throw new Error(`插件不存在: ${pluginId}`);
    }

    if (meta.enabled) {
      return; // 已经激活，无需重复激活
    }

    // 激活依赖的插件
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      for (const depId of plugin.dependencies) {
        await this.activatePlugin(depId);
      }
    }

    // 调用插件的activate方法
    if (typeof plugin.activate === 'function') {
      await plugin.activate(this.app);
    }

    // 注册插件路由
    if (plugin.routes) {
      this.registerPluginRoutes(pluginId, plugin.routes);
    }

    // 注册插件钩子
    if (plugin.hooks) {
      for (const [hookName, callback] of Object.entries(plugin.hooks)) {
        this.addHook(hookName, callback, pluginId);
      }
    }

    // 更新插件状态
    meta.enabled = true;
    this.emit(PluginEvents.ACTIVATED, { pluginId });
  }

  /**
   * 停用插件
   * @param {string} pluginId - 插件ID
   */
  async deactivatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    const meta = this.pluginsMeta.get(pluginId);

    if (!plugin) {
      throw new Error(`插件不存在: ${pluginId}`);
    }

    if (!meta.enabled) {
      return; // 已经停用，无需重复停用
    }

    // 检查依赖关系，不能停用被其他插件依赖的插件
    for (const [id, p] of this.plugins.entries()) {
      const pMeta = this.pluginsMeta.get(id);
      if (pMeta.enabled && p.dependencies && p.dependencies.includes(pluginId)) {
        throw new Error(`无法停用插件 ${pluginId}，它被插件 ${id} 依赖`);
      }
    }

    // 调用插件的deactivate方法
    if (typeof plugin.deactivate === 'function') {
      await plugin.deactivate(this.app);
    }

    // 移除插件钩子
    for (const hookName in this.hooks) {
      this.hooks[hookName] = this.hooks[hookName].filter(
        hook => hook.pluginId !== pluginId
      );
    }

    // 更新插件状态
    meta.enabled = false;
    this.emit(PluginEvents.DEACTIVATED, { pluginId });
  }

  /**
   * 注册插件路由
   * @param {string} pluginId - 插件ID
   * @param {Object} routes - 路由对象
   */
  registerPluginRoutes(pluginId, routes) {
    const router = this.app.get('router');
    if (!router) {
      console.warn(`无法注册插件 ${pluginId} 的路由: 应用路由对象不存在`);
      return;
    }

    // 假设routes是Express路由对象或包含路由定义的对象
    try {
      if (typeof routes === 'function') {
        // 如果routes是一个函数，传入app实例让它注册路由
        routes(this.app);
      } else {
        // 否则假设它是一个路由对象，直接挂载
        router.use(`/api/plugins/${pluginId}`, routes);
      }
    } catch (error) {
      console.error(`注册插件 ${pluginId} 的路由失败:`, error);
    }
  }

  /**
   * 获取所有插件元数据
   */
  getAllPluginsMeta() {
    return Array.from(this.pluginsMeta.values());
  }

  /**
   * 获取特定插件元数据
   * @param {string} pluginId - 插件ID
   */
  getPluginMeta(pluginId) {
    return this.pluginsMeta.get(pluginId);
  }

  /**
   * 获取特定插件实例
   * @param {string} pluginId - 插件ID
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }
}

module.exports = PluginManager;
