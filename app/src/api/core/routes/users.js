/**
 * 用户管理路由
 */
const express = require('express');
const { asyncHandler } = require('../../../utils/apiHelper');
const usersController = require('../controllers/usersController');
const { verifyToken, checkRole } = require('../../../core/middleware/auth');

const router = express.Router();

// 公共路由
router.post('/register', asyncHandler(usersController.register));
router.post('/login', asyncHandler(usersController.login));

// 需要身份验证的路由
router.use(verifyToken);

// 获取当前用户信息
router.get('/me', asyncHandler(usersController.getCurrentUser));
router.put('/me', asyncHandler(usersController.updateCurrentUser));

// 管理员路由 - 需要管理员角色
router.get('/', checkRole(['admin']), asyncHandler(usersController.getAllUsers));
router.get('/:id', checkRole(['admin']), asyncHandler(usersController.getUserById));
router.put('/:id', checkRole(['admin']), asyncHandler(usersController.updateUser));
router.delete('/:id', checkRole(['admin']), asyncHandler(usersController.deleteUser));

module.exports = router;
