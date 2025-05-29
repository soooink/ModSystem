/**
 * 插件配置文件
 * 定义插件的启用状态、加载顺序和配置项
 */

module.exports = {
  // 插件目录路径 (相对于项目根目录)
  pluginsDir: 'src/plugins',

  // 全局插件设置
  settings: {
    // 是否自动加载所有插件
    autoLoadAll: true,
    
    // 是否自动激活所有插件
    autoActivateAll: true,
    
    // 插件热加载 (开发模式下有效)
    hotReload: process.env.NODE_ENV === 'development',
  },

  // 插件特定配置
  plugins: {
    // 示例：用户管理插件
    'user-management': {
      enabled: true,
      config: {
        // 插件特定配置项
        userCacheTime: 3600,
        maxLoginAttempts: 5,
      }
    },
    
    // 示例：内容管理插件
    'content-management': {
      enabled: true,
      config: {
        // 插件特定配置项
        mediaTypes: ['image', 'video', 'document'],
        maxFileSize: 5242880, // 5MB
      }
    },
    
    // 其他插件配置...
  },
  
  // 插件加载顺序 (可选，按此顺序加载和初始化)
  loadOrder: [
    'user-management',
    'content-management',
    // 其他插件...
  ]
};
