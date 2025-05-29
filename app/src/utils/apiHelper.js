/**
 * API辅助工具
 * 提供API请求和响应的标准化处理
 */

/**
 * 成功响应
 * @param {object} res - Express响应对象
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} statusCode - HTTP状态码
 */
const success = (res, data = null, message = '操作成功', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * 错误响应
 * @param {object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 * @param {any} errors - 详细错误信息
 */
const error = (res, message = '操作失败', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * 异步处理器
 * 用于包装异步路由处理函数，统一处理错误
 * @param {Function} fn - 异步路由处理函数
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('API错误:', err);
      return error(
        res, 
        err.message || '服务器内部错误', 
        err.statusCode || 500, 
        process.env.NODE_ENV === 'development' ? err.stack : undefined
      );
    });
  };
};

/**
 * 分页辅助函数
 * @param {object} req - Express请求对象
 * @param {number} defaultLimit - 默认每页条数
 * @param {number} maxLimit - 最大每页条数
 * @returns {object} - 分页参数
 */
const getPagination = (req, defaultLimit = 10, maxLimit = 100) => {
  const page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || defaultLimit;
  
  // 确保limit不超过最大值
  limit = Math.min(limit, maxLimit);
  
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip
  };
};

/**
 * 生成分页响应
 * @param {object} res - Express响应对象
 * @param {array} data - 数据数组
 * @param {number} total - 总条数
 * @param {object} pagination - 分页参数对象
 * @param {string} message - 响应消息
 */
const paginatedResponse = (res, data, total, pagination, message = '查询成功') => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return success(res, {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }, message);
};

module.exports = {
  success,
  error,
  asyncHandler,
  getPagination,
  paginatedResponse
};
