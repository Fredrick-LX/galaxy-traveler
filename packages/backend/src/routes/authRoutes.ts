/**
 * 认证路由
 */

import { Router } from 'express';
import {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
} from '@/services/authService';
import { asyncHandler, sendSuccess, sendError } from '@/utils/routeHelpers';

const router = Router();

/**
 * 注册接口
 * POST /api/auth/register
 */
router.post('/register', asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;

    // 验证必填字段
    if (!email || !name || !password) {
        return sendError(res, '邮箱、用户名和密码为必填项');
    }

    const result = await registerUser(email, name, password);

    if (!result.success) {
        return sendError(res, result.message);
    }

    return res.status(201).json(result);
}));

/**
 * 登录接口
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
        return sendError(res, '邮箱和密码为必填项');
    }

    const result = await loginUser(email, password);

    if (!result.success) {
        return sendError(res, result.message);
    }

    return res.status(200).json(result);
}));

/**
 * 请求重置密码接口
 * POST /api/auth/request-reset
 */
router.post('/request-reset', asyncHandler(async (req, res) => {
    const { email } = req.body;

    // 验证必填字段
    if (!email) {
        return sendError(res, '邮箱为必填项');
    }

    const result = await requestPasswordReset(email);

    return res.status(200).json(result);
}));

/**
 * 重置密码接口
 * POST /api/auth/reset-password
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
    const { email, resetToken, newPassword } = req.body;

    // 验证必填字段
    if (!email || !resetToken || !newPassword) {
        return sendError(res, '邮箱、重置令牌和新密码为必填项');
    }

    const result = await resetPassword(email, resetToken, newPassword);

    if (!result.success) {
        return sendError(res, result.message);
    }

    return res.status(200).json(result);
}));

export default router;

