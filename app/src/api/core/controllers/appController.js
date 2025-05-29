/**
 * 应用管理控制器
 */
const fs = require('fs');
const path = require('path');
const { success, error } = require('../../../utils/apiHelper');
const { logger } = require('../../../utils/logger');
const pluginConfig = require('../../../config/pluginConfig');

/**
 * 获取应用信息
 */
const getAppInfo = async (req, res) => {
  try {
    const appInfo = {
      name: '多元插件化系统',
      version: '1.0.0',
      description: '可扩展的插件化应用框架',
      environment: process.env.NODE_ENV || 'development',
      apiVersion: 'v1',
      uptime: process.uptime()
    };

    return success(res, appInfo, '获取应用信息成功');
  } catch (err) {
    logger.error(`获取应用信息失败: ${err.message}`, { error: err });
    return error(res, '获取应用信息失败', 500);
  }
};

/**
 * 获取所有插件
 */
const getAllPlugins = async (req, res) => {
  try {
    const pluginManager = req.app.get('pluginManager');
    if (!pluginManager) {
      return error(res, '插件管理器未初始化', 500);
    }

    const plugins = pluginManager.getAllPluginsMeta();
    return success(res, plugins, '获取插件列表成功');
  } catch (err) {
    logger.error(`获取插件列表失败: ${err.message}`, { error: err });
    return error(res, '获取插件列表失败', 500);
  }
};

/**
 * 获取指定插件信息
 */
const getPluginById = async (req, res) => {
  const { id } = req.params;

  try {
    const pluginManager = req.app.get('pluginManager');
    if (!pluginManager) {
      return error(res, '插件管理器未初始化', 500);
    }

    const plugin = pluginManager.getPluginMeta(id);
    if (!plugin) {
      return error(res, `插件 ${id} 不存在`, 404);
    }

    return success(res, plugin, '获取插件信息成功');
  } catch (err) {
    logger.error(`获取插件信息失败: ${err.message}`, { error: err });
    return error(res, '获取插件信息失败', 500);
  }
};

/**
 * 激活插件
 */
const activatePlugin = async (req, res) => {
  const { id } = req.params;

  try {
    const pluginManager = req.app.get('pluginManager');
    if (!pluginManager) {
      return error(res, '插件管理器未初始化', 500);
    }

    // 检查插件是否存在
    const plugin = pluginManager.getPluginMeta(id);
    if (!plugin) {
      return error(res, `插件 ${id} 不存在`, 404);
    }

    // 如果插件已激活，直接返回成功
    if (plugin.enabled) {
      return success(res, plugin, '插件已经处于激活状态');
    }

    // 激活插件
    await pluginManager.activatePlugin(id);
    const updatedPlugin = pluginManager.getPluginMeta(id);

    logger.info(`插件已激活: ${id}`);
    return success(res, updatedPlugin, '插件激活成功');
  } catch (err) {
    logger.error(`激活插件失败: ${err.message}`, { error: err });
    return error(res, `激活插件失败: ${err.message}`, 500);
  }
};

/**
 * 停用插件
 */
const deactivatePlugin = async (req, res) => {
  const { id } = req.params;

  try {
    const pluginManager = req.app.get('pluginManager');
    if (!pluginManager) {
      return error(res, '插件管理器未初始化', 500);
    }

    // 检查插件是否存在
    const plugin = pluginManager.getPluginMeta(id);
    if (!plugin) {
      return error(res, `插件 ${id} 不存在`, 404);
    }

    // 如果插件已停用，直接返回成功
    if (!plugin.enabled) {
      return success(res, plugin, '插件已经处于停用状态');
    }

    // 停用插件
    await pluginManager.deactivatePlugin(id);
    const updatedPlugin = pluginManager.getPluginMeta(id);

    logger.info(`插件已停用: ${id}`);
    return success(res, updatedPlugin, '插件停用成功');
  } catch (err) {
    logger.error(`停用插件失败: ${err.message}`, { error: err });
    return error(res, `停用插件失败: ${err.message}`, 500);
  }
};

/**
 * 扫描查找新插件
 */
const scanForPlugins = async (req, res) => {
  try {
    const pluginManager = req.app.get('pluginManager');
    if (!pluginManager) {
      return error(res, '插件管理器未初始化', 500);
    }

    const pluginsPath = path.join(process.cwd(), 'src', 'plugins');
    if (!fs.existsSync(pluginsPath)) {
      return error(res, '插件目录不存在', 404);
    }

    // 获取当前已加载的插件ID
    const loadedPluginIds = Array.from(pluginManager.plugins.keys());

    // 扫描插件目录
    const pluginDirs = fs.readdirSync(pluginsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !loadedPluginIds.includes(name));

    // 加载新发现的插件
    const newPlugins = [];
    for (const pluginDir of pluginDirs) {
      try {
        const plugin = await pluginManager.loadPlugin(pluginDir);
        if (plugin) {
          newPlugins.push(pluginManager.getPluginMeta(plugin.id));
        }
      } catch (error) {
        logger.error(`加载插件 ${pluginDir} 失败:`, error);
      }
    }

    logger.info(`扫描发现 ${newPlugins.length} 个新插件`);
    return success(res, newPlugins, `扫描完成，发现 ${newPlugins.length} 个新插件`);
  } catch (err) {
    logger.error(`扫描插件失败: ${err.message}`, { error: err });
    return error(res, '扫描插件失败', 500);
  }
};

/**
 * 获取系统设置
 */
const getSettings = async (req, res) => {
  try {
    // 从配置文件获取当前设置
    const settings = {
      pluginsDir: pluginConfig.pluginsDir,
      autoLoadAll: pluginConfig.settings.autoLoadAll,
      autoActivateAll: pluginConfig.settings.autoActivateAll,
      hotReload: pluginConfig.settings.hotReload
    };

    return success(res, settings, '获取系统设置成功');
  } catch (err) {
    logger.error(`获取系统设置失败: ${err.message}`, { error: err });
    return error(res, '获取系统设置失败', 500);
  }
};

/**
 * 更新系统设置
 * 注意：这只是一个示例，实际上应该将更改持久化到配置文件
 */
const updateSettings = async (req, res) => {
  const { autoLoadAll, autoActivateAll, hotReload } = req.body;

  try {
    // 更新内存中的设置
    // 注意：在真实应用中，应该将这些更改写入配置文件
    if (autoLoadAll !== undefined) {
      pluginConfig.settings.autoLoadAll = autoLoadAll;
    }
    
    if (autoActivateAll !== undefined) {
      pluginConfig.settings.autoActivateAll = autoActivateAll;
    }
    
    if (hotReload !== undefined) {
      pluginConfig.settings.hotReload = hotReload;
    }

    logger.info('系统设置已更新');
    return success(res, pluginConfig.settings, '系统设置更新成功');
  } catch (err) {
    logger.error(`更新系统设置失败: ${err.message}`, { error: err });
    return error(res, '更新系统设置失败', 500);
  }
};

module.exports = {
  getAppInfo,
  getAllPlugins,
  getPluginById,
  activatePlugin,
  deactivatePlugin,
  scanForPlugins,
  getSettings,
  updateSettings
};
