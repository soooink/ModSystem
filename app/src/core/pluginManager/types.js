/**
 * 插件接口定义
 * 定义插件必须实现的方法和属性
 */

/**
 * 插件基础接口
 * @typedef {Object} Plugin
 * @property {string} id - 插件唯一标识符
 * @property {string} name - 插件名称
 * @property {string} version - 插件版本
 * @property {string} description - 插件描述
 * @property {Function} initialize - 插件初始化方法
 * @property {Function} [activate] - 插件激活方法
 * @property {Function} [deactivate] - 插件停用方法
 * @property {Object} [routes] - 插件路由
 * @property {Object} [hooks] - 插件钩子函数
 * @property {Array} [dependencies] - 插件依赖
 */

/**
 * 插件元数据
 * @typedef {Object} PluginMeta
 * @property {string} id - 插件唯一标识符
 * @property {string} name - 插件名称
 * @property {string} version - 插件版本
 * @property {string} description - 插件描述
 * @property {boolean} enabled - 插件是否启用
 * @property {Array} dependencies - 插件依赖
 * @property {Object} [config] - 插件配置
 */

/**
 * 插件管理器事件类型
 */
const PluginEvents = {
  LOADED: 'plugin:loaded',
  ACTIVATED: 'plugin:activated',
  DEACTIVATED: 'plugin:deactivated',
  ERROR: 'plugin:error'
};

module.exports = {
  PluginEvents
};
