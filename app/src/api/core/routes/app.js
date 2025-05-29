/**
 * 应用管理路由
 */
const express = require('express');
const { asyncHandler } = require('../../../utils/apiHelper');
const appController = require('../controllers/appController');
const { verifyToken, checkRole } = require('../../../core/middleware/auth');

const router = express.Router();

// 公共路由 - 获取应用信息
router.get('/info', asyncHandler(appController.getAppInfo));

// 需要身份验证的路由
router.use(verifyToken);

// 插件相关路由 - 需要管理员权限
router.get('/plugins', asyncHandler(appController.getAllPlugins));
router.get('/plugins/:id', asyncHandler(appController.getPluginById));
router.post('/plugins/:id/activate', checkRole(['admin']), asyncHandler(appController.activatePlugin));
router.post('/plugins/:id/deactivate', checkRole(['admin']), asyncHandler(appController.deactivatePlugin));
router.post('/plugins/scan', checkRole(['admin']), asyncHandler(appController.scanForPlugins));

// 系统设置路由 - 需要管理员权限
router.get('/settings', checkRole(['admin']), asyncHandler(appController.getSettings));
router.put('/settings', checkRole(['admin']), asyncHandler(appController.updateSettings));

module.exports = router;
