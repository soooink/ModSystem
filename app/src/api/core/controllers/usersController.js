/**
 * 用户管理控制器
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { success, error } = require('../../../utils/apiHelper');
const { logger } = require('../../../utils/logger');
const User = require('../../../core/database/models/User');

/**
 * 用户注册
 */
const register = async (req, res) => {
  const { username, email, password } = req.body;

  // 验证请求数据
  if (!username || !email || !password) {
    return error(res, '用户名、邮箱和密码不能为空', 400);
  }

  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return error(res, '用户名或邮箱已被注册', 400);
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user', // 默认角色
      allowedPlugins: [] // 默认没有任何插件权限
    });

    await user.save();
    logger.info(`新用户注册: ${username}`);

    // 移除密码字段
    const userResponse = user.toObject();
    delete userResponse.password;

    return success(res, userResponse, '注册成功', 201);
  } catch (err) {
    logger.error(`用户注册失败: ${err.message}`, { error: err });
    return error(res, '注册失败，请稍后再试', 500);
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // 验证请求数据
  if (!email || !password) {
    return error(res, '邮箱和密码不能为空', 400);
  }

  try {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, '密码错误', 401);
    }

    // 生成JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, allowedPlugins: user.allowedPlugins },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );

    logger.info(`用户登录: ${user.username}`);

    return success(res, { token }, '登录成功');
  } catch (err) {
    logger.error(`用户登录失败: ${err.message}`, { error: err });
    return error(res, '登录失败，请稍后再试', 500);
  }
};

/**
 * 获取当前用户信息
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    return success(res, user, '获取用户信息成功');
  } catch (err) {
    logger.error(`获取用户信息失败: ${err.message}`, { error: err });
    return error(res, '获取用户信息失败', 500);
  }
};

/**
 * 更新当前用户信息
 */
const updateCurrentUser = async (req, res) => {
  const { username, email } = req.body;

  try {
    // 构建更新对象
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // 如果包含密码，则更新密码
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    logger.info(`用户更新个人信息: ${user.username}`);
    return success(res, user, '用户信息更新成功');
  } catch (err) {
    logger.error(`更新用户信息失败: ${err.message}`, { error: err });
    return error(res, '更新用户信息失败', 500);
  }
};

/**
 * 获取所有用户 (仅管理员)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return success(res, users, '获取所有用户成功');
  } catch (err) {
    logger.error(`获取所有用户失败: ${err.message}`, { error: err });
    return error(res, '获取用户列表失败', 500);
  }
};

/**
 * 获取指定用户 (仅管理员)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    return success(res, user, '获取用户信息成功');
  } catch (err) {
    logger.error(`获取用户信息失败: ${err.message}`, { error: err });
    return error(res, '获取用户信息失败', 500);
  }
};

/**
 * 更新指定用户 (仅管理员)
 */
const updateUser = async (req, res) => {
  try {
    // 构建更新对象
    const updateData = {};
    const fields = ['username', 'email', 'role', 'allowedPlugins'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // 如果包含密码，则更新密码
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    logger.info(`管理员更新用户: ${user.username}`);
    return success(res, user, '用户信息更新成功');
  } catch (err) {
    logger.error(`更新用户信息失败: ${err.message}`, { error: err });
    return error(res, '更新用户信息失败', 500);
  }
};

/**
 * 删除指定用户 (仅管理员)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    logger.info(`管理员删除用户: ${user.username}`);
    return success(res, null, '用户删除成功');
  } catch (err) {
    logger.error(`删除用户失败: ${err.message}`, { error: err });
    return error(res, '删除用户失败', 500);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
