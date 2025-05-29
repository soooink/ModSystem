/**
 * 数据库连接模块
 * 负责初始化数据库连接并提供操作接口
 */
const mongoose = require('mongoose');
const config = require('../../config/env');

class Database {
  constructor() {
    this.connection = null;
    this.models = new Map();
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      mongoose.connection.on('connected', () => {
        console.log('MongoDB 连接成功');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB 连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB 连接断开');
      });

      this.connection = await mongoose.connect(config.database.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      return this.connection;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 注册模型
   * @param {string} name - 模型名称
   * @param {mongoose.Schema} schema - 模型架构
   * @param {string} [collection] - 集合名称，可选
   * @returns {mongoose.Model} - 注册的模型
   */
  registerModel(name, schema, collection) {
    if (this.models.has(name)) {
      return this.models.get(name);
    }

    const model = mongoose.model(name, schema, collection);
    this.models.set(name, model);
    return model;
  }

  /**
   * 获取已注册的模型
   * @param {string} name - 模型名称
   * @returns {mongoose.Model|null} - 模型或null
   */
  getModel(name) {
    return this.models.get(name) || null;
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('数据库连接已关闭');
    }
  }
}

// 单例模式
const database = new Database();
module.exports = database;
