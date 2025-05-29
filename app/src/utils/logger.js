/**
 * 日志工具
 * 提供统一的日志记录功能
 */
const winston = require('winston');
const config = require('../config/env');

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 创建Winston日志记录器
const logger = winston.createLogger({
  level: config.log?.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'plugin-system' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let metaStr = '';
          if (Object.keys(metadata).length > 0 && metadata.service) {
            const { service, ...rest } = metadata;
            metaStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
          }
          return `${timestamp} [${service || 'app'}] ${level}: ${message}${metaStr}`;
        })
      )
    }),
    
    // 文件日志 - 所有日志
    new winston.transports.File({ filename: 'logs/combined.log' }),
    
    // 文件日志 - 错误日志
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

/**
 * 创建一个插件特定的日志记录器
 * @param {string} pluginId - 插件ID
 * @returns {object} - 日志记录器
 */
const createPluginLogger = (pluginId) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { ...meta, plugin: pluginId }),
    info: (message, meta = {}) => logger.info(message, { ...meta, plugin: pluginId }),
    warn: (message, meta = {}) => logger.warn(message, { ...meta, plugin: pluginId }),
    error: (message, meta = {}) => logger.error(message, { ...meta, plugin: pluginId })
  };
};

module.exports = {
  logger,
  createPluginLogger
};
