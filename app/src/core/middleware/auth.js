/**
 * 身份验证中间件
 * 用于验证API请求的身份和权限
 */
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

/**
 * 验证JWT token的中间件
 */
const verifyToken = (req, res, next) => {
  // 从请求头获取token
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供访问令牌' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    
    // 将解码后的用户信息附加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的访问令牌' });
  }
};

/**
 * 检查用户是否具有指定角色的中间件
 * @param {string[]} roles - 允许的角色数组
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '需要先进行身份验证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '没有足够权限执行此操作' });
    }

    next();
  };
};

/**
 * 插件权限验证中间件
 * 检查用户是否有权访问特定插件
 * @param {string} pluginId - 插件ID
 */
const checkPluginAccess = (pluginId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '需要先进行身份验证' });
    }

    // 这里应该从用户权限或者某个地方检查用户是否有权访问该插件
    // 简化示例，假设用户的 allowedPlugins 数组中包含可访问的插件ID
    if (req.user.allowedPlugins && !req.user.allowedPlugins.includes(pluginId)) {
      return res.status(403).json({ message: `没有权限访问插件: ${pluginId}` });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkPluginAccess
};
